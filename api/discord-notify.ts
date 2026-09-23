import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Discord Webhook URL not configured' });
  }

  const order = req.body;

  const discordPayload = {
    content: `🛒 **طلب شراء جديد في متجر VortexMC**`,
    embeds: [
      {
        title: `فاتورة الطلب: ${order.orderId}`,
        color: 0x00d2ff,
        fields: [
          { name: '👤 اسم العميل (IGN)', value: `\`${order.player}\` (${order.platform?.toUpperCase() || 'JAVA'})`, inline: true },
          { name: '📦 المنتج / الرتبة', value: `**${order.package}**`, inline: true },
          { name: '💰 السعر', value: `**${order.priceEgp}** (${order.priceUsd})`, inline: true },
          { name: '📱 رقم المحول (فودافون كاش)', value: `\`${order.senderPhone}\``, inline: true },
          { name: '🔢 مرجع العملية', value: `\`${order.transactionRef || 'غير مدخل'}\``, inline: true },
          { name: '🔐 كود الأمان Passcode', value: `\`${order.securityPin}\``, inline: true },
          { name: '🌐 IP العميل', value: `\`${order.clientIp || '127.0.0.1'}\``, inline: true },
          { name: '⚙️ أمر التفعيل الجاهز', value: `\`\`\`${order.rankCommand || `/lp user ${order.player} parent add${order.package}`}\`\`\`` }
        ],
        ...(order.paymentProof ? { image: { url: order.paymentProof } } : {}),
        footer: { text: 'VortexMC Store Security System' },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    if (discordRes.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ error: 'Failed to send to Discord' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}