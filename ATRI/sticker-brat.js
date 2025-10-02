import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, prefix, command }) => {
  if (!text) return m.reply(
    `Gunakan format:\n${prefix + command} teks\n\nContoh:\n${prefix + command} Hello World`
  )

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })
    const buffer = await (await fetch(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`)).buffer()
    let stiker = await sticker(buffer, false, stickpack, stickauth)
    if (stiker) await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    else m.reply('❌ Gagal membuat stiker.')
  } catch (err) {
    console.error(err)
    m.reply('❌ Gagal membuat stiker.')
  }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^brat$/i
handler.limit = true
handler.daftar = true

export default handler