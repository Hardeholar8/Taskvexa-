export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, user_id, amount, purpose = 'promoter_wallet_funding', title = 'TaskVexa Wallet Funding', description = 'Promoter wallet funding' } = req.body || {};
    const numericAmount = Math.round(Number(amount));
    const allowedPurpose = purpose === 'promoter_wallet_funding' || purpose === 'worker_activation';

    if (!email || !user_id || !Number.isFinite(numericAmount) || numericAmount <= 0 || !allowedPurpose) {
      return res.status(400).json({ error: 'Enter a valid deposit amount.' });
    }

    // Support the common Flutterwave secret-key names so the checkout works
    // even if the existing Vercel project uses FLW_SECRET_KEY instead of SECRET_KEY.
    const secret = process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || process.env.SECRET_KEY;
    if (!secret) {
      console.error('Flutterwave checkout: no secret key configured');
      return res.status(500).json({ error: 'Automatic payment is not configured yet. Please contact TaskVexa support.' });
    }

    const base = (process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host || 'taskvexa-delta.vercel.app'}`).replace(/\/$/, '');
    const prefix = purpose === 'promoter_wallet_funding' ? 'TVX-WALLET' : 'TVX-ACT';
    const txRef = `${prefix}-${user_id}-${Date.now()}`;
    const callback = purpose === 'promoter_wallet_funding' ? 'promoter-payment-callback.html' : 'activation-callback.html';

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: numericAmount,
        currency: 'NGN',
        redirect_url: `${base}/${callback}`,
        customer: { email },
        meta: { user_id, purpose },
        customizations: {
          title: String(title).slice(0, 80),
          description: String(description).slice(0, 200)
        }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.status !== 'success' || !data.data?.link) {
      console.error('Flutterwave checkout rejected:', response.status, data);
      return res.status(502).json({
        error: data.message || data.data?.message || 'Flutterwave could not start the payment. Please try again.'
      });
    }

    return res.status(200).json({
      payment_url: data.data.link,
      checkout_url: data.data.link,
      tx_ref: txRef
    });
  } catch (error) {
    console.error('Flutterwave checkout error', error);
    return res.status(500).json({ error: 'Unable to start automatic payment. Please try again.' });
  }
}
