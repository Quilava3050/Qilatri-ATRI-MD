import { areJidsSameUser } from "@whiskeysockets/baileys"

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    // ambil semua channel yang diketahui bot
    let channels = Object.values(conn.chats)
      .filter(v => v.id && v.id.endsWith('@newsletter')) // filter channel
      .map(v => ({
        id: v.id,
        name: v.name || 'Tidak diketahui'
      }))

    if (!channels.length) {
      return m.reply('❌ Tidak ada channel terdeteksi.\n\nPastikan bot kamu sudah join atau pernah menerima pesan dari channel.')
    }

    let teks = `📢 *Daftar Channel yang Dikenal Bot:*\n\n`
    teks += channels.map((v, i) => `${i + 1}. ${v.name}\n   🆔 ${v.id}`).join('\n\n')
    teks += `\n\nKamu bisa pakai ID di atas pada \`newsletterJid\` di contextInfo.`
    
    await conn.reply(m.chat, teks, m)
  } catch (e) {
    console.error(e)
    m.reply('⚠️ Terjadi kesalahan saat mengambil data channel.')
  }
}

handler.help = ['getchannelid']
handler.tags = ['tools']
handler.command = /^getchannel(id)?$/i
handler.owner = true

export default handler