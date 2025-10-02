let handler = async (m, { conn, command }) => {
  const grup = await conn.groupMetadata(m.chat);
  let mmk = grup.participants;
  let member = mmk.getRandom();
  
  let titles = {
    'cantik': '👸 Paling Cantik',
    'ganteng': '🤴 Paling Ganteng',
    'pintar': '🎓 Paling Pintar',
    'rajin': '📚 Paling Rajin',
    'baik': '😇 Paling Baik Hati',
    'hebat': '💪 Paling Hebat',
    'lucu': '🤣 Paling Lucu',
    'kreatif': '🎨 Paling Kreatif',
    'setia': '💑 Paling Setia',
    'dermawan': '🤝 Paling Dermawan',
    'ramah': '🤗 Paling Ramah',
    'peduli': '❤️ Paling Peduli',
    'jago': '🏆 Paling Jago',
    'bijak': '🧘 Paling Bijaksana',
    'romantis': '💝 Paling Romantis'
  };

  if (titles[command]) {
    let teks = `*${titles[command]}*\n\n`
    teks += `Yang paling ${command} di grup ini adalah: @${member.id.split('@')[0]}\n`
    teks += `\n_Selamat! Kamu terpilih~ 🎉_`
    
    await conn.sendMessage(m.chat, {
      text: teks,
      mentions: [member.id]
    }, { quoted: m });
  }
};

handler.help = ['cantik', 'ganteng', 'pintar', 'rajin', 'baik', 'hebat', 'lucu', 'kreatif', 'setia', 'dermawan', 'ramah', 'peduli', 'jago', 'bijak', 'romantis'];
handler.tags = ['fun'];
handler.command = handler.help;
handler.group = true;

export default handler;