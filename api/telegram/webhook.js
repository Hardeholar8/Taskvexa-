const TELEGRAM_API = 'https://api.telegram.org/bot' + process.env.TELEGRAM_BOT_TOKEN;

function button(text, url) {
  return { text, url };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body || {};
    const members = update.message?.new_chat_members || [];

    if (!members.length) return res.status(200).json({ ok: true });

    const chatId = update.message.chat.id;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://taskvexa.com.ng').replace(/\/$/, '');
    const registerUrl = process.env.TASKVEXA_REGISTER_URL || site + '/register.html';
    const channelUrl = process.env.TASKVEXA_CHANNEL_URL;
    const rulesUrl = process.env.TASKVEXA_RULES_URL;
    const supportUrl = process.env.TASKVEXA_SUPPORT_URL || site + '/support.html';

    for (const member of members) {
      if (member.is_bot) continue;

      const name = [member.first_name, member.last_name].filter(Boolean).join(' ') || 'there';
      const mention = member.username
        ? '@' + member.username
        : '<a href="tg://user?id=' + member.id + '">' + escapeHtml(name) + '</a>';

      const text =
        '💜 <b>WELCOME TO TASKVEXA</b>\n\n' +
        'Welcome ' + mention + '! We’re excited to have you in our official community.\n\n' +
        'This is where you’ll receive important announcements, updates, guidance, and support.\n\n' +
        'Please read the pinned regulations, respect other members, and beware of impersonators or fake links.\n\n' +
        'Stay active, explore opportunities, and grow with us! 💜';

      const buttons = [
        [button('🚀 REGISTER ON TASKVEXA', registerUrl)],
      ];
      if (channelUrl) buttons.push([button('📢 OFFICIAL CHANNEL', channelUrl)]);
      if (rulesUrl) buttons.push([button('📜 COMMUNITY RULES', rulesUrl)]);
      buttons.push([button('💬 TASKVEXA SUPPORT', supportUrl)]);

      await fetch(TELEGRAM_API + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: { inline_keyboard: buttons },
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram welcome error:', error);
    return res.status(500).json({ error: 'Telegram welcome failed' });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
