const handler = async (m, { conn }) => {
  let who
  if (m.isGroup) {
    if (m.mentionedJid && m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else {
      who = m.sender
    }
  } else {
    who = m.sender
  }

  const jid = who
  const type = jid.includes('@lid')
    ? 'Channel (LID)'
    : jid.includes('@s.whatsapp.net')
      ? 'Pengguna WhatsApp'
      : 'Tipe tidak dikenal'

  await conn.sendMessage(m.chat, {
    text: `乂  *G E T  -  L I D*\n\n*ID Target:* ${jid}\n*Tipe Akun:* ${type}`,
    mentions: [jid]
  }, { quoted: m })
}

handler.help = ['getlid <tag/reply>']
handler.command = ['getlid', 'gtlid']
handler.tags = ['info']
handler.desc = 'Cek LID dari user yang di tag atau reply'
handler.register = true

export default handler