export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, user_id, amount, purpose = 'platform_payment', title = 'TaskVexa Payment', description = 'TaskVexa payment', return_path = 'activation-callback.html' } = req.body || {};
    const numericAmount = Number(amount);
    if (!email || !user_id || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured' });
    const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
    const txRef = `TVX-${String(purpose).toUpperCase().replace(/[^A-Z0-9_-]/g, '_')}-${user_id}-${Date.now()}`;
    const response = await fetch('https://api.flutterwave.com/v3/charges?type=bank_transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: numericAmount,
        currency: 'NGN',
        email,
        fullname: 'TaskVexa User',
        bank_transfer_options: { expires: 3600 },
        meta: { user_id, purpose, return_path }
      })
    });
    const data = await response.json();
    const auth = data?.meta?.authorization;
    if (!response.ok || data.status !== 'success' || !auth?.transfer_account || !auth?.transfer_bank) {
      return res.status(502).json({ error: data.message || 'Flutterwave bank transfer initialization failed' });
    }
    const params = new URLSearchParams({
      tx_ref: txRef,
      user_id,
      purpose,
      amount: String(numericAmount),
      bank: String(auth.transfer_bank),
      account: String(auth.transfer_account),
      transfer_amount: String(auth.transfer_amount || numericAmount),
      expires: String(auth.account_expiration || ''),
      title,
      description,
      return_path
    });
    return res.status(200).json({
      payment_url: `${base}/payment-transfer.html?${params.toString()}`,
      tx_ref: txRef,
      bank: auth.transfer_bank,
      account_number: auth.transfer_account,
      transfer_amount: auth.transfer_amount || numericAmount,
      expires: auth.account_expiration || null,
      purpose
    });
  } catch (error) {
    console.error('Flutterwave checkout error', error);
    return res.status(500).json({ error: 'Unable to start payment' });
  }
}
