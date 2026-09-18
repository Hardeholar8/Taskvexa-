export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { transaction_id, tx_ref, expected_amount, purpose } = req.body || {};
    if (!transaction_id && !tx_ref) return res.status(400).json({ error: 'Missing transaction ID or reference', verified: false });

    const secret = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured', verified: false });

    const url = transaction_id
      ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`;

    const r = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    const j = await r.json();
    const data = j?.data || {};
    if (!r.ok || j.status !== 'success' || data.status !== 'successful') {
      return res.status(400).json({ error: data.status === 'pending' ? 'Payment is still being confirmed. Please wait a moment and try again.' : 'Payment verification failed', verified: false, payment_status: data.status || null });
    }

    const verifiedRef = String(data.tx_ref || tx_ref || '').trim();
    const meta = data.meta || data.meta_data || {};
    let userId = meta.user_id || null;
    let transactionPurpose = meta.purpose || null;

    const activationMatch = verifiedRef.match(/^TVX-ACT-([0-9a-fA-F-]{20,})-(\d+)$/);
    const walletMatch = verifiedRef.match(/^TVX-WALLET-([0-9a-fA-F-]{20,})-(\d+)$/);
    if (activationMatch) {
      userId = userId || activationMatch[1];
      transactionPurpose = transactionPurpose || 'worker_activation';
    }
    if (walletMatch) {
      userId = userId || walletMatch[1];
      transactionPurpose = transactionPurpose || 'promoter_wallet_funding';
    }

    if (!userId || !transactionPurpose) return res.status(400).json({ error: 'Invalid TaskVexa transaction', verified: false });
    if (purpose && transactionPurpose !== purpose) return res.status(400).json({ error: 'Payment purpose mismatch', verified: false });

    const amount = Number(data.amount);
    const currency = data.currency;
    if (currency !== 'NGN' || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid payment amount', verified: false });
    if (expected_amount != null && Number(expected_amount) !== amount) return res.status(400).json({ error: 'Payment amount mismatch', verified: false });

    let walletFunded = false;
    let membershipActivated = false;
    if (transactionPurpose === 'membership') {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
      const supabaseUrl = process.env.SUPABASE_URL || 'https://dxtlnrthlpdaobnbazny.supabase.co';
      if (!serviceKey) return res.status(500).json({ error: 'Membership settlement is not configured', verified: false });

      const membershipResponse = await fetch(
        `${supabaseUrl}/rest/v1/memberships?payment_reference=eq.${encodeURIComponent(verifiedRef)}&select=id,user_id,plan_id,status,amount,expires_at&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const memberships = await membershipResponse.json().catch(() => []);
      const pending = memberships?.[0];
      if (!membershipResponse.ok || !pending) return res.status(400).json({ error: 'Membership payment record not found', verified: false });
      if (String(pending.user_id) !== String(userId)) return res.status(400).json({ error: 'Membership account mismatch', verified: false });
      if (String(pending.status) === 'active') {
        return res.status(200).json({ verified: true, membership_activated: true, user_id: userId, purpose: transactionPurpose, amount, transaction_id: data.id, tx_ref: verifiedRef });
      }

      const planResponse = await fetch(
        `${supabaseUrl}/rest/v1/membership_plans?id=eq.${encodeURIComponent(pending.plan_id)}&select=id,price,duration_days&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const plans = await planResponse.json().catch(() => []);
      const plan = plans?.[0];
      if (!plan) return res.status(400).json({ error: 'Membership plan not found', verified: false });
      const expected = Number(plan.price);
      if (!Number.isFinite(expected) || amount < expected) return res.status(400).json({ error: 'Membership payment amount mismatch', verified: false });

      const activeResponse = await fetch(
        `${supabaseUrl}/rest/v1/memberships?user_id=eq.${encodeURIComponent(userId)}&status=eq.active&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,expires_at&order=expires_at.desc&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
      );
      const activeRows = await activeResponse.json().catch(() => []);
      const active = activeRows?.[0];
      const now = new Date();
      const start = active?.expires_at && new Date(active.expires_at) > now ? new Date(active.expires_at) : now;
      const expires = new Date(start.getTime() + Number(plan.duration_days || 30) * 86400000);

      if (active?.id) {
        const expireOld = await fetch(
          `${supabaseUrl}/rest/v1/memberships?id=eq.${encodeURIComponent(active.id)}`,
          {
            method: 'PATCH',
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify({ status: 'expired', updated_at: now.toISOString() })
          }
        );
        if (!expireOld.ok) return res.status(502).json({ error: 'Unable to update existing membership', verified: false });
      }

      const settle = await fetch(
        `${supabaseUrl}/rest/v1/memberships?id=eq.${encodeURIComponent(pending.id)}&status=eq.pending`,
        {
          method: 'PATCH',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            status: 'active',
            amount: expected,
            starts_at: start.toISOString(),
            expires_at: expires.toISOString(),
            transaction_id: String(data.id),
            paid_at: now.toISOString(),
            updated_at: now.toISOString()
          })
        }
      );
      if (!settle.ok) {
        console.error('Membership settlement failed:', settle.status, await settle.text());
        return res.status(502).json({ error: 'Payment verified but membership activation failed. Please contact support.', verified: false });
      }
      membershipActivated = true;
    }
    if (transactionPurpose === 'promoter_wallet_funding') {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
      const supabaseUrl = process.env.SUPABASE_URL || 'https://dxtlnrthlpdaobnbazny.supabase.co';
      if (!serviceKey) return res.status(500).json({ error: 'Promoter payment settlement is not configured', verified: false });
      const settle = await fetch(`${supabaseUrl}/rest/v1/rpc/record_promoter_funding_for_user`, {
        method: 'POST',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_user_id: userId, p_amount: amount, p_reference: verifiedRef })
      });
      const settled = await settle.json().catch(() => false);
      if (!settle.ok || settled !== true) {
        console.error('Promoter funding settlement failed:', settle.status, settled);
        return res.status(502).json({ error: 'Payment verified but wallet settlement failed. Please contact support.', verified: false });
      }
      walletFunded = true;
    }

    return res.status(200).json({ verified: true, wallet_funded: walletFunded, membership_activated: membershipActivated, user_id: userId, purpose: transactionPurpose, amount, transaction_id: data.id, tx_ref: verifiedRef });
  } catch (error) {
    console.error('Flutterwave verification error', error);
    return res.status(500).json({ error: 'Unable to verify payment', verified: false });
  }
}
