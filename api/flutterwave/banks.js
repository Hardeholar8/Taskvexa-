export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const secret = process.env.SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Payment service is not configured' });

    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.status !== 'success') {
      return res.status(502).json({ error: data.message || 'Unable to load banks' });
    }

    const banks = (Array.isArray(data.data) ? data.data : [])
      .map(bank => ({ code: String(bank.code || bank.id || ''), name: String(bank.name || '').trim() }))
      .filter(bank => bank.code && bank.name)
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({ banks });
  } catch (error) {
    console.error('Flutterwave bank list error', error);
    return res.status(500).json({ error: 'Unable to load banks right now.' });
  }
}
