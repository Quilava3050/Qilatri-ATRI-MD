import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text }) => {
  if (!m.quoted) throw 'Reply stiker yang mau di-WM!'
  let stiker = false
  try {
    let [packname, ...author] = (text || '').split('|')
    author = (author || []).join('|')

    // kalau kosong → pakai default global
    packname = packname?.trim() || global.stickpack
    author = author?.trim() || global.stickauth

    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw 'Reply stiker dengan format webp!'
    let img = await m.quoted.download()
    if (!img) throw 'Gagal download stiker!'
    
    stiker = await addExif(img, packname, author)
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, { asSticker: true })
    } else {
      throw '❌ Proses WM gagal'
    }
  }
}

handler.help = ['wm']
handler.tags = ['sticker']
handler.limit = true
handler.command = /^(wm|colong|take)$/i
handler.daftar = true

export default handler
