import uploadImage from '../lib/uploadFile.js'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let [atas, bawah] = text.split('|')
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) throw `📌 Balas gambar dengan perintah\n\n${usedPrefix + command} <${atas ? atas : 'teks atas'}>|<${bawah ? bawah : 'teks bawah'}>\n${usedPrefix + command} <|${bawah ? bawah : 'teks bawah'}>\n${usedPrefix + command} <${atas ? atas : 'teks atas'}>`
    
    try {
        // react loading ⏳
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        let img = await q.download()
        let url = await uploadImage(img)
        
        if (!atas && bawah) {
            atas = ' '
        }
        
        let meme = `https://api.memegen.link/images/custom/${encodeURIComponent(atas ? atas : '')}/${encodeURIComponent(bawah ? bawah : '')}.png?background=${url}`
        
        let stiker = await sticker(false, meme, global.packname, global.author)
        if (stiker) {
            await conn.sendFile(m.chat, stiker, '', global.author, m, '', { asSticker: 1 })
            // react sukses ✅
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        } else {
            // react gagal ❌
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        }
    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        return m.reply('⚠️ Terjadi kesalahan saat membuat meme.')
    }
}

handler.help = ['smeme <teks atas>|<teks bawah>']
handler.tags = ['sticker']
handler.command = /^(smeme)$/i
handler.daftar = true
handler.limit = true

export default handler