export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN is not configured' });

  const host = req.headers.host;
  if (!host) return res.status(400).json({ error: 'Missing host' });

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const webhookUrl = protocol + '://' + host + '/api/telegram/webhook';

  const r = await fetch('https://api.telegram.org/bot' + token + '/setWebhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const data = await r.json().catch(() => ({}));
  return res.status(r.ok ? 200 : 500).json(data);
}
