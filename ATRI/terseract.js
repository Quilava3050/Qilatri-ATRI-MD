import Jimp from "jimp"
import Tesseract from "tesseract.js"
import translate from "@vitalets/google-translate-api"

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ''
  if (!/image/.test(mime)) return m.reply('📸 Kirim atau balas gambar yang ada teksnya!')

  m.reply('🔍 Membaca teks dengan mode akurasi tinggi...')

  let img = await q.download?.()
  let image = await Jimp.read(img)
  image
    .grayscale()        // ubah ke hitam putih
    .contrast(0.5)      // tambahkan kontras
    .normalize()        // perbaiki pencahayaan
    .resize(800, Jimp.AUTO) // perbesar biar OCR mudah baca
  let buffer = await image.getBufferAsync(Jimp.MIME_JPEG)

  let { data: { text } } = await Tesseract.recognize(buffer, 'eng+ind')
  if (!text.trim()) return m.reply('⚠️ Tidak ada teks yang terbaca di gambar.')

  let translated = await translate(text, { to: 'id' })
  m.reply(`🖼️ *Teks dalam gambar:*\n${text.trim()}\n\n🔤 *Terjemahan:*\n${translated.text}`)
}

handler.help = ['bacaimg']
handler.tags = ['tools']
handler.command = /^bacaimg$/i
export default handler