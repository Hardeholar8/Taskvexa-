export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.FLW_PUBLIC_KEY;
  if (!key) return res.status(500).json({ error: 'Flutterwave public key is not configured.' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ publicKey: key });
}
