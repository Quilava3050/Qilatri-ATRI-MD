import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, args }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime) throw '❌ Balas atau kirim media yang ingin diupload!'

    let media = await q.download()
    if (!media) throw '⚠️ Gagal mendownload media.'

    const uploaders = {
      '1': 'idweb',
      'idweb': 'idweb',
      '2': 'catbox',
      'catbox': 'catbox',
      '3': 'telegraph',
      'telegraph': 'telegraph'
    }

    let input = (args[0] || '').toLowerCase()

    // kalau user belum pilih uploader
    if (!uploaders[input]) {
      await conn.sendMessage(m.chat, { react: { text: 'ℹ️', key: m.key } })
      await conn.sendMessage(m.chat, {
        text: `
📤 *Pilih uploader yang ingin digunakan:*

1️⃣ idweb.tech  
2️⃣ catbox.moe  
3️⃣ telegraph (default bawaan bot)

📝 Contoh:
> .tourl 1
> .tourl idweb
> .tourl telegraph
`,
      }, { quoted: m })
      return
    }

    // kasih reaksi proses
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let uploader = uploaders[input]
    let link
    if (['idweb', 'catbox'].includes(uploader)) {
      link = await uploadImage(media, uploader)
    } else {
      link = await uploadFile(media)
    }

    const { ext } = await fileTypeFromBuffer(media) || {}
    let size = media.length.toLocaleString()

    // react sukses
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    await conn.sendMessage(m.chat, {
      text: `
✅ *Upload Berhasil!*

🌐 *Uploader:* ${uploader}
📎 *Link:* ${link}
📁 *Tipe:* ${ext || 'unknown'}
💾 *Ukuran:* ${size} bytes
🕒 *Expired:* ${['idweb','catbox'].includes(uploader) ? 'No Expiry' : 'Unknown'}

© Atri AI Assistant`,
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `❌ *Upload gagal!*  
${String(e)}`,
    }, { quoted: m })
  }
}

handler.help = ['tourl', 'upload']
handler.tags = ['tools']
handler.command = /^(tourl|upload)$/i
handler.limit = true
handler.daftar = true
export default handler
