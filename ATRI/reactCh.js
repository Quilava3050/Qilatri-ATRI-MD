let handler = async (m, { conn, args }) => {
  if (args.length < 3) return m.reply(`❌ Gunakan format:\n.reactionch <id_channel> <msg_id> <emoji>\n\nContoh:\n.reactionch 12036344741298748@newsletter 200 🤮`);
  
  const [idChannel, msgId, emoji] = args;

  try {
    await conn.newsletterReactMessage(idChannel, msgId, emoji);
    await m.reply(`✅ Berhasil kirim reaction ${emoji} ke channel:\n📢 ${idChannel}\n🆔 Message ID: ${msgId}`);
  } catch (e) {
    console.error(e);
    await m.reply(`❌ Gagal kirim reaction:\n${e.message || e}`);
  }
};

handler.help = ['reactionch'];
handler.tags = ['tools'];
handler.command = /^reactionch$/i;

export default handler;