export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, email, plan_id } = req.body || {};
    if (!user_id || !email || !plan_id) return res.status(400).json({ error: 'Missing membership payment details.' });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const supabaseUrl = 'https://dxtlnrthlpdaobnbazny.supabase.co';
    const flwSecret = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || process.env.SECRET_KEY;
    if (!serviceKey || !flwSecret) return res.status(500).json({ error: 'Membership payment is not configured yet.' });

    const authResponse = await fetch(supabaseUrl + '/auth/v1/admin/users/' + encodeURIComponent(user_id), {
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey }
    });
    const authUser = await authResponse.json().catch(() => ({}));
    if (!authResponse.ok || authUser?.id !== user_id || String(authUser?.email || '').toLowerCase() !== String(email).toLowerCase()) {
      return res.status(403).json({ error: 'Account verification failed.' });
    }

    const planResponse = await fetch(
      supabaseUrl + '/rest/v1/membership_plans?select=id,name,price,duration_days,is_active&is_active=eq.true&order=price.asc',
      { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
    );
    const plans = await planResponse.json().catch(() => []);
    if (!planResponse.ok || !Array.isArray(plans)) {
      console.error('Membership plans lookup failed:', planResponse.status, plans);
      return res.status(502).json({ error: 'Unable to load membership plans.' });
    }

    const plan = plans.find(p => String(p.id) === String(plan_id));
    if (!plan) {
      console.error('Requested membership plan was not found:', { plan_id, available_plan_ids: plans.map(p => p.id) });
      return res.status(404).json({ error: 'Membership plan not found.' });
    }

    const amount = Number(plan.price);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid membership price.' });

    const membershipsResponse = await fetch(
      supabaseUrl + '/rest/v1/memberships?select=plan_id,status,expires_at&user_id=eq.' + encodeURIComponent(user_id) + '&status=eq.active&order=expires_at.desc&limit=1',
      { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
    );
    const memberships = await membershipsResponse.json().catch(() => []);
    if (!membershipsResponse.ok) {
      console.error('Active membership lookup failed:', membershipsResponse.status, memberships);
      return res.status(502).json({ error: 'Unable to verify your current membership.' });
    }

    const active = memberships?.[0];
    if (active && new Date(active.expires_at) > new Date()) {
      if (String(active.plan_id) === String(plan.id)) return res.status(409).json({ error: 'You are already subscribed to this plan.' });

      const rank = { Starter: 1, Pro: 2, Premium: 3 };
      const currentPlanResponse = await fetch(
        supabaseUrl + '/rest/v1/membership_plans?select=name&id=eq.' + encodeURIComponent(active.plan_id) + '&limit=1',
        { headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey } }
      );
      const currentPlans = await currentPlanResponse.json().catch(() => []);
      const currentName = currentPlans?.[0]?.name;
      if (currentName && rank[plan.name] <= rank[currentName]) {
        return res.status(409).json({ error: 'Only an upgrade to a higher membership plan is available.' });
      }
    }

    const txRef = 'TVX-MEMBER-' + user_id + '-' + Date.now();
    const insertResponse = await fetch(supabaseUrl + '/rest/v1/memberships', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ user_id, plan_id: plan.id, status: 'pending', amount, payment_reference: txRef })
    });
    if (!insertResponse.ok) {
      const detail = await insertResponse.text();
      console.error('Membership record creation failed:', insertResponse.status, detail);
      return res.status(502).json({ error: 'Unable to create the membership payment record.' });
    }

    const base = (process.env.NEXT_PUBLIC_SITE_URL || ('https://' + (req.headers.host || 'taskvexa-delta.vercel.app'))).replace(/\/$/, '');
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + flwSecret, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        redirect_url: base + '/membership-callback.html',
        customer: { email: String(email).toLowerCase() },
        meta: { user_id, plan_id, purpose: 'membership', upgrade_from: active?.plan_id || null },
        customizations: {
          title: ('TaskVexa ' + plan.name + ' Membership').slice(0, 80),
          description: ('30-day ' + plan.name + ' membership').slice(0, 200)
        }
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      console.error('Membership Flutterwave checkout rejected:', response.status, data);
      return res.status(502).json({ error: data.message || 'Flutterwave could not start the membership payment.' });
    }

    return res.status(200).json({
      checkout_url: data.data.link,
      tx_ref: txRef,
      plan: { id: plan.id, name: plan.name, price: amount, duration_days: plan.duration_days }
    });
  } catch (error) {
    console.error('Membership checkout error:', error);
    return res.status(500).json({ error: 'Unable to start membership payment. Please try again.' });
  }
}
