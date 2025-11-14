// ATRI/vidai.js
import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
  let [prompt, imageUrl] = text.split('|').map(v => v.trim())
  if (!prompt || !imageUrl) {
    return m.reply(`⚠️ Contoh pemakaian:\n.${command} sunset di pantai|https://example.com/image.jpg`)
  }

  await m.reply('🎬 Sedang membuat video AI, mohon tunggu 1–3 menit...')

  try {
    const payload = {
      videoPrompt: prompt,
      videoAspectRatio: "16:9",
      videoDuration: 5,
      videoQuality: "540p",
      videoModel: "v4.5",
      videoImageUrl: imageUrl,
      videoPublic: false
    }

    const gen = await axios.post('https://veo31ai.io/api/pixverse-token/gen', payload, {
      headers: { 'Content-Type': 'application/json' }
    })

    const taskId = gen?.data?.taskId
    if (!taskId) throw '❌ Gagal membuat task video.'

    let videoUrl = null
    const timeout = Date.now() + 180000 // 3 menit
    while (Date.now() < timeout) {
      const res = await axios.post('https://veo31ai.io/api/pixverse-token/get', {
        taskId,
        videoPublic: false,
        videoQuality: "540p",
        videoAspectRatio: "16:9",
        videoPrompt: prompt
      }, { headers: { 'Content-Type': 'application/json' } })

      if (res.data?.videoData?.url) {
        videoUrl = res.data.videoData.url
        break
      }

      await new Promise(r => setTimeout(r, 5000)) // cek setiap 5 detik
    }

    if (!videoUrl) return m.reply('⚠️ Video belum tersedia atau gagal dibuat.')

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `🎥 *Video AI Selesai!*\n\n🧠 Prompt: ${prompt}\n🌆 Gambar sumber: ${imageUrl}`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat membuat video.')
  }
}

handler.help = ['vidai <prompt>|<url>']
handler.tags = ['ai']
handler.command = /^vidai$/i
handler.limit = true

export default handler