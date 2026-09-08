export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { transaction_id } = req.body || {};
    if (!transaction_id) return res.status(400).json({ error: 'Missing transaction ID' });
    const secret = process.env.FLW_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured' });
    const r = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`, { headers: { Authorization: `Bearer ${secret}` } });
    const j = await r.json();
    if (!r.ok || j.status !== 'success' || j.data?.status !== 'successful') return res.status(400).json({ error: 'Payment verification failed', verified: false });
    const meta = j.data?.meta || {};
    if (meta.purpose !== 'worker_activation' || !meta.user_id) return res.status(400).json({ error: 'Invalid activation transaction', verified: false });
    const amount = Number(j.data?.amount);
    const currency = j.data?.currency;
    if (currency !== 'NGN' || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Invalid payment amount', verified: false });
    return res.status(200).json({ verified: true, user_id: meta.user_id, amount, transaction_id: j.data.id, tx_ref: j.data.tx_ref });
  } catch (error) {
    console.error('Flutterwave verification error', error);
    return res.status(500).json({ error: 'Unable to verify payment', verified: false });
  }
}
