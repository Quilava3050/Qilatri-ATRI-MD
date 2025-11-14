import fetch from 'node-fetch'
import uploadImage from '../lib/uploadFile.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime.startsWith('image/')) throw `📸 Kirim/Reply gambar dengan caption *${usedPrefix + command}*`

    m.reply('🪞 Mengubah gambarmu menjadi efek mirror... tunggu sebentar ya!')

    let media = await q.download()
    let url = await uploadImage(media)
    if (!url) throw '❌ Gagal mengunggah gambar untuk diproses.'

    let api = `https://api.elrayyxml.web.id/api/ephoto/mirror?url=${encodeURIComponent(url)}`
    let res = await fetch(api)
    if (!res.ok) throw `❌ Gagal mengambil data dari API. (HTTP ${res.status})`

    let contentType = res.headers.get('content-type') || ''
    let buffer

    if (contentType.includes('application/json')) {
      let json = await res.json()
      let imageUrl = json.result || json.data?.url || json.url || json.image
      if (!imageUrl) throw '❌ Respons API tidak berisi URL gambar.'
      let r2 = await fetch(imageUrl)
      if (!r2.ok) throw '❌ Gagal mengunduh gambar dari URL yang dikembalikan API.'
      buffer = await r2.buffer()
    } else {
      buffer = await res.buffer()
    }

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: '✨ Selesai — ini versi mirror dari gambarmu.'
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Terjadi kesalahan:\n${e.message || e}`)
  }
}

handler.help = ['tomirror']
handler.tags = ['ai']
handler.command = /^tomirror$/i
handler.limit = true
handler.daftar = true

export default handler