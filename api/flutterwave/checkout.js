export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, user_id, amount } = req.body || {};
    const numericAmount = Number(amount);
    if (!email || !user_id || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured' });
    const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const txRef = `TVX-ACT-${user_id}-${Date.now()}`;
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: numericAmount,
        currency: 'NGN',
        payment_options: 'banktransfer',
        bank_transfer_options: { expires: 3600 },
        redirect_url: `${base}/activation-callback.html`,
        customer: { email },
        meta: { user_id, purpose: 'worker_activation' },
        customizations: { title: 'TaskVexa Worker Activation', description: 'Worker account activation' }
      })
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      return res.status(502).json({ error: data.message || 'Flutterwave bank transfer checkout failed' });
    }
    return res.status(200).json({ checkout_url: data.data.link, tx_ref: txRef });
  } catch (error) {
    console.error('Flutterwave checkout error', error);
    return res.status(500).json({ error: 'Unable to start payment' });
  }
}
