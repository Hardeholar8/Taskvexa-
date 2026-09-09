export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { account_number, account_bank } = req.body || {};
    const accountNumber = String(account_number || '').trim();
    const bankCode = String(account_bank || '').trim();

    if (!/^\d{10}$/.test(accountNumber) || !/^\d+$/.test(bankCode)) {
      return res.status(400).json({ verified: false, error: 'Enter a valid 10-digit account number and select a valid bank.' });
    }

    const secret = process.env.SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ verified: false, error: 'Payment service is not configured' });
    }

    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_number: accountNumber,
        account_bank: bankCode
      })
    });

    const data = await response.json().catch(() => ({}));
    const accountName = data?.data?.account_name;

    if (!response.ok || data.status !== 'success' || !accountName) {
      return res.status(400).json({
        verified: false,
        error: data.message || 'Unable to verify this bank account.'
      });
    }

    return res.status(200).json({
      verified: true,
      account_number: accountNumber,
      account_name: String(accountName).trim()
    });
  } catch (error) {
    console.error('Flutterwave account resolution error', error);
    return res.status(500).json({ verified: false, error: 'Unable to verify bank account right now.' });
  }
}
