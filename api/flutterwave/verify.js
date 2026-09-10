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

    return res.status(200).json({ verified: true, user_id: userId, purpose: transactionPurpose, amount, transaction_id: data.id, tx_ref: verifiedRef });
  } catch (error) {
    console.error('Flutterwave verification error', error);
    return res.status(500).json({ error: 'Unable to verify payment', verified: false });
  }
}
