export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, user_id, amount, purpose = 'promoter_wallet_funding', title = 'TaskVexa Wallet Funding', description = 'Promoter wallet funding' } = req.body || {};
    const numericAmount = Number(amount);
    const allowedPurpose = purpose === 'promoter_wallet_funding' || purpose === 'worker_activation';
    if (!email || !user_id || !Number.isFinite(numericAmount) || numericAmount <= 0 || !allowedPurpose) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured' });
    const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const prefix = purpose === 'promoter_wallet_funding' ? 'TVX-WALLET' : 'TVX-ACT';
    const txRef = `${prefix}-${user_id}-${Date.now()}`;
    const callback = purpose === 'promoter_wallet_funding' ? 'promoter-payment-callback.html' : 'activation-callback.html';
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: numericAmount,
        currency: 'NGN',
        redirect_url: `${base}/${callback}`,
        customer: { email },
        meta: { user_id, purpose },
        customizations: { title, description }
      })
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      return res.status(502).json({ error: data.message || 'Flutterwave checkout failed' });
    }
    return res.status(200).json({ payment_url: data.data.link, checkout_url: data.data.link, tx_ref: txRef });
  } catch (error) {
    console.error('Flutterwave checkout error', error);
    return res.status(500).json({ error: 'Unable to start payment' });
  }
}
