let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('⚠️ Fitur ini hanya untuk grup!');
  
  // Cek admin dengan cara yang lebih sederhana
  const isAdmin = m.isGroup ? ((m.key.participant && m.key.participant.includes(m.sender)) || m.key.fromMe) : false;
  if (!isAdmin) return m.reply('❌ Maaf, hanya admin yang bisa menggunakan fitur ini!');
  
  if (!m.quoted) return m.reply(`❌ Reply pesan user yang ingin diperingatkan!\n\n*Contoh:* ${usedPrefix + command} jangan spam`);
  
  try {
    const target = m.quoted.sender;
    const reason = args.join(' ') || 'Tidak ada alasan';
    const groupName = await conn.getName(m.chat);
    
    let warn = `*[ ⚠️ PERINGATAN ⚠️ ]*\n\n`
    warn += `*• User:* @${target.split('@')[0]}\n`
    warn += `*• Alasan:* ${reason}\n`
    warn += `*• Group:* ${groupName}`
    
    // Kirim ke grup
    await m.reply(warn, null, { mentions: [target] });
    
    // Kirim ke private
    await conn.sendMessage(target, { text: warn });
    
    m.reply('✅ Berhasil mengirim peringatan');
    
  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal memberikan peringatan!')
  }
};

handler.help = ['peringatan <reply>'];
handler.tags = ['group'];
handler.command = /^(warn|peringatan)$/i;
handler.group = true;
handler.admin = true;

export default handler;