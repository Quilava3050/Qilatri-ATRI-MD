let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // Get all groups
    const groups = await conn.groupFetchAllParticipating();
    const groupList = Object.values(groups);
    
    // Format group information
    const txt = `📊 *DAFTAR GRUP BOT*\n\n` +
      `*Total Grup:* ${groupList.length}\n\n` +
      groupList.map((v, i) => {
        return `${i + 1}. ${v.subject}\n` +
               `│ • *ID:* ${v.id}\n` +
               `│ • *Member:* ${v.participants.length}\n` +
               `│ • *Created:* ${new Date(v.creation * 1000).toDateString()}\n` +
               `│ • *Owner:* ${v.owner ? '@' + v.owner.split('@')[0] : 'Tidak diketahui'}\n` +
               `╰────────────────`
      }).join('\n\n');
    
    await m.reply(txt, null, {
      mentions: conn.parseMention(txt)
    });
    
  } catch (e) {
    console.error(e);
    m.reply('Terjadi error saat mengambil data grup');
  }
};

handler.help = ['botjoin'];
handler.tags = ['owner'];
handler.command = /^(botjoin|p)$/i;

export default handler;