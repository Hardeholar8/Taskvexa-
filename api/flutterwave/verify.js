export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { transaction_id, tx_ref, expected_amount, purpose } = req.body || {};
    if (!transaction_id && !tx_ref) return res.status(400).json({ error: 'Missing transaction ID or reference', verified: false });
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured', verified: false });

    const url = transaction_id
      ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(tx_ref)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
    const j = await r.json();
    if (!r.ok || j.status !== 'success' || j.data?.status !== 'successful') {
      return res.status(400).json({ error: 'Payment verification failed', verified: false });
    }

    const meta = j.data?.meta || {};
    if (!meta.user_id || !meta.purpose) return res.status(400).json({ error: 'Invalid TaskVexa transaction', verified: false });
    if (purpose && meta.purpose !== purpose) return res.status(400).json({ error: 'Payment purpose mismatch', verified: false });

    const amount = Number(j.data?.amount);
    const currency = j.data?.currency;
    if (currency !== 'NGN' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount', verified: false });
    }
    if (expected_amount != null && Number(expected_amount) !== amount) {
      return res.status(400).json({ error: 'Payment amount mismatch', verified: false });
    }

    return res.status(200).json({
      verified: true,
      user_id: meta.user_id,
      purpose: meta.purpose,
      amount,
      transaction_id: j.data.id,
      tx_ref: j.data.tx_ref
    });
  } catch (error) {
    console.error('Flutterwave verification error', error);
    return res.status(500).json({ error: 'Unable to verify payment', verified: false });
  }
}
