import { GoogleGenAI, Modality } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const apiKey = 'AIzaSyDwUjkpzTi3fjxWwh8O9lmK_tqaIRVnN00' // langsung di sini
const ai = new GoogleGenAI({ apiKey })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_FILE = path.join(__dirname, '..', 'tmp', 'gemini-image.png')

let handler = async (m, { conn, args, text, command }) => {
  if (!text) return m.reply(`Contoh:\n.${command} kucing lucu pakai jaket hitam terbang di bulan`)

  await m.reply('⏳ Sedang membuat gambar dari AI, tunggu sebentar...')

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: text,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    })

    let imageSaved = false
    let description = ''

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        description += part.text.trim()
      } else if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        fs.writeFileSync(TMP_FILE, buffer)
        imageSaved = true
      }
    }

    if (!imageSaved) return m.reply('❌ Gagal membuat gambar.')

    await conn.sendMessage(m.chat, {
      image: fs.readFileSync(TMP_FILE),
      caption: `🎨 *Gemini Image AI*\n\n📥 Prompt: ${text}\n📝 Deskripsi: ${description || 'Tidak ada keterangan'}`,
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❌ Terjadi kesalahan saat membuat gambar.')
  }
}

handler.help = ['geminiimg <prompt>']
handler.tags = ['ai']
handler.command = /^geminiimg$/i
handler.limit = true
handler.daftar = true

export default handler