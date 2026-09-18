export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, email, plan_id } = req.body || {};
    if (!user_id || !email || !plan_id) {
      return res.status(400).json({ error: 'Missing membership payment details.' });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://dxtlnrthlpdaobnbazny.supabase.co';
    const flwSecret = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || process.env.SECRET_KEY;
    if (!serviceKey || !flwSecret) {
      return res.status(500).json({ error: 'Membership payment is not configured yet.' });
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user_id)}`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
    });
    const authUser = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok || authUser?.id !== user_id || String(authUser?.email || '').toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ error: 'Account verification failed.' });
    }

    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/membership_plans?id=eq.${encodeURIComponent(plan_id)}&is_active=eq.true&select=id,name,price,duration_days`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    const plans = await planResponse.json().catch(() => []);
    const plan = plans?.[0];
    if (!planResponse.ok || !plan) return res.status(404).json({ error: 'Membership plan not found.' });

    const amount = Number(plan.price);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid membership price.' });

    const txRef = `TVX-MEMBER-${user_id}-${Date.now()}`;
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/memberships`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        user_id,
        plan_id: plan.id,
        status: 'pending',
        amount,
        payment_reference: txRef
      })
    });
    if (!insertResponse.ok) {
      const detail = await insertResponse.text();
      console.error('Membership record creation failed:', insertResponse.status, detail);
      return res.status(502).json({ error: 'Unable to create the membership payment record.' });
    }

    const base = (process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host || 'taskvexa-delta.vercel.app'}`).replace(/\/$/, '');
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${flwSecret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        redirect_url: `${base}/membership-callback.html`,
        customer: { email: String(email).toLowerCase() },
        meta: { user_id, plan_id, purpose: 'membership' },
        customizations: {
          title: `TaskVexa ${plan.name} Membership`.slice(0, 80),
          description: `30-day ${plan.name} membership`.slice(0, 200)
        }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      console.error('Membership Flutterwave checkout rejected:', response.status, data);
      return res.status(502).json({ error: data.message || 'Flutterwave could not start the membership payment.' });
    }

    return res.status(200).json({ checkout_url: data.data.link, tx_ref: txRef, plan: { id: plan.id, name: plan.name, price: amount, duration_days: plan.duration_days } });
  } catch (error) {
    console.error('Membership checkout error:', error);
    return res.status(500).json({ error: 'Unable to start membership payment. Please try again.' });
  }
}
