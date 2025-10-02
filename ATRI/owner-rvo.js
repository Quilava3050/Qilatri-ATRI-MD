const handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  try {
    let media = await q.download?.();
    // Send to owner only
    for (let ownerNumber of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')) {
      await conn.sendFile(ownerNumber, media, null, `Report dari: @${m.sender.split('@')[0]}`, m);
    }
    m.reply('✅ Media berhasil dikirim ke owner!');
  } catch (e) {
    m.reply('❌ Media gagal dimuat!');
  }
};

handler.help = ['jir']
handler.tags = ['owner']
handler.command = /^(jir)$/i
handler.desc = 'Mengirim media ke owner bot'

export default handler