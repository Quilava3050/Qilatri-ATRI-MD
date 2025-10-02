const handler = {};

handler.before = async function (msg, { conn }) {
  try {
    const emojis = [
      "😊", "👍", "🤩", "🎉", "😍",
      "🤔", "👀", "😳", "❤", "😎",
      "🇵🇸", "🤍", "🥰", "⭐", "😭"
    ];

    const likeEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Hanya untuk status WhatsApp
    if (!msg || msg.key?.remoteJid !== 'status@broadcast') return false;

    const decodedJid = await conn.decodeJid(conn.user.id);
    await conn.sendMessage(msg.key.remoteJid, {
      react: {
        key: msg.key,
        text: likeEmoji
      }
    }, {
      statusJidList: [msg.key.participant, decodedJid]
    });

  } catch (error) {
    console.error('❌ Gagal memproses status:', error.message || error);
  }

  return true;
};

export default handler;