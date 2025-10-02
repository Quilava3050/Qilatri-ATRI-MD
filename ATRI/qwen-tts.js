// file: plugins/tools-qwentts.js (ESM)

import axios from 'axios'

const voices = ['Dylan', 'Sunny', 'Jada', 'Cherry', 'Ethan', 'Serena', 'Chelsie']

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `🚩 Masukkan teks dan nama suara!\n\nContoh:\n${usedPrefix + command} Halo, selamat pagi|Sunny\n\nVoice tersedia:\n${voices.join(', ')}`
  }

  const [message, voice] = text.split('|').map(s => s.trim())
  const selectedVoice = voice || 'Dylan'

  if (!voices.includes(selectedVoice)) {
    throw `❌ Voice tidak dikenali!\nGunakan salah satu dari:\n${voices.join(', ')}`
  }

  await m.reply('⏳ Sedang membuat audio, tunggu sebentar...')

  try {
    const session_hash = Math.random().toString(36).substring(2)
    await axios.post('https://qwen-qwen-tts-demo.hf.space/gradio_api/queue/join?', {
      data: [message, selectedVoice],
      event_data: null,
      fn_index: 2,
      trigger_id: 13,
      session_hash
    })

    const { data } = await axios.get(`https://qwen-qwen-tts-demo.hf.space/gradio_api/queue/data?session_hash=${session_hash}`)

    let result
    const lines = data.split('\n\n')
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const d = JSON.parse(line.slice(6))
        if (d.msg === 'process_completed') result = d.output.data[0].url
      }
    }

    if (!result) throw '⚠ Gagal mendapatkan audio.'

    await conn.sendMessage(m.chat, {
      audio: { url: result },
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '❌ Terjadi kesalahan saat membuat TTS.'
  }
}

handler.help = ['qwentts'].map(v => v + ' <teks>|<voice>')
handler.tags = ['tools', 'voice']
handler.command = /^qwentts$/i
handler.limit = false

export default handler