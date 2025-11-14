import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { addExif } from '../lib/sticker.js'

global.stickpack = '© Atri-MD'
global.stickauth = '© Atri AI Assistant'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    let [packname, ...author] = args.join` `.split`|`
    packname = packname || global.stickpack
    author = (author || []).join`|` || global.stickauth

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let media = await q.download?.()

    if (!media) throw `❌ Tidak ada media ditemukan!`

    if (/webp/g.test(mime)) {
      stiker = await addExif(media, packname, author)
    } else if (/image/g.test(mime)) {
      const sticker = new Sticker(media, {
        pack: packname,
        author: author,
        type: StickerTypes.FULL,
        quality: 100
      })
      stiker = await sticker.toBuffer()
    } else if (/video/g.test(mime)) {
      if ((q.msg || q).seconds > 10) throw '❌ Maksimal durasi 10 detik!'
      const sticker = new Sticker(media, {
        pack: packname,
        author: author,
        type: StickerTypes.FULL,
        quality: 100,
        fps: 15,
        loop: 0
      })
      stiker = await sticker.toBuffer()
    } else if (args[0] && isUrl(args[0])) {
      const sticker = new Sticker(args[0], {
        pack: packname,
        author: author,
        type: StickerTypes.FULL
      })
      stiker = await sticker.toBuffer()
    } else throw `❌ Balas Gambar/Video lalu ketik ${usedPrefix + command}`

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, { asSticker: true })
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    m.reply("❌ Gagal membuat sticker!\n" + e)
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.alias = ['stiker', 'sticker', 'sgif', 'stikergif', 'stickergif']
handler.command = /^s(tic?ker)?(gif)?$/i
handler.limit = true
handler.daftar = true

export default handler

const isUrl = (text) => text.match(
  new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi')
)