import { createHash } from 'crypto'

let handler = async (m, { conn }) => {
  let sn = createHash('md5').update(m.sender).digest('hex')
  let teks = `*Serial Nomor Anda:*\n${sn}`

  await conn.sendMessage(m.chat, {
    text: teks,
    footer: 'Klik tombol di bawah untuk menyalin kode SN Anda',
    buttons: [
      {
        buttonId: `copy_${sn}`,
        buttonText: { displayText: '📋 Salin SN' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['ceksn']
handler.tags = ['user']
handler.command = /^(ceksn)$/i

export default handler