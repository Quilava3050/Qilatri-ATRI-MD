import axios from 'axios'
import { getCharacter, getAllCharacters, characterExists } from '../lib/characterconfig.js'

const defaultCharacter = 'atri'
const aiModels = [
  "gpt-4.1-nano",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o4-mini",
  "deepseek-r1",
  "deepseek-v3",
  "claude-3.7",
  "gemini-2.0",
  "grok-3-mini",
  "qwen-qwq-32b",
  "gpt-4o",
  "o3",
  "gpt-4o-mini",
  "llama-3.3",
]

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya untuk grup.')

  conn.groupAI = conn.groupAI || {}
  const chatId = m.chat

  if (!text) {
    return m.reply(`Ketik:\n${usedPrefix + command} on\n${usedPrefix + command} off\n${usedPrefix + command} model <nama>\n${usedPrefix + command} list`)
  }

  const args = text.toLowerCase().split(' ')
  const action = args[0]

  // 🔹 ON
  if (action === 'on') {
    conn.groupAI[chatId] = {
      enabled: true,
      model: 'gpt-4.1-nano',
      character: defaultCharacter,
      history: []
    }
    return m.reply('🤖 Fitur Grup Auto AI diaktifkan untuk grup ini!')
  }

  // 🔹 OFF
  if (action === 'off') {
    delete conn.groupAI[chatId]
    return m.reply('❌ Grup Auto AI dinonaktifkan.')
  }

  // 🔹 Ganti Model
  if (action === 'model') {
    if (!args[1]) {
      const list = aiModels.map((m, i) => `${i + 1}. ${m}`).join('\n')
      return m.reply(`🧠 *Daftar Model AI:*\n\n${list}\n\nGunakan:\n${usedPrefix + command} model <nama>`)
    }

    const model = args[1]
    if (!aiModels.includes(model)) return m.reply('❌ Model tidak ditemukan.')

    conn.groupAI[chatId] = conn.groupAI[chatId] || {}
    conn.groupAI[chatId].model = model
    return m.reply(`✅ Model AI untuk grup ini diubah ke *${model}*.`)
  }

  // 🔹 List Model
  if (action === 'list') {
    const list = aiModels.map((m, i) => `${i + 1}. ${m}`).join('\n')
    return m.reply(`🧠 *Daftar Model AI:*\n\n${list}`)
  }

  return m.reply('Format perintah tidak dikenali. Gunakan: on/off/model/list')
}

// 🔹 BEFORE — deteksi pesan dari grup
handler.before = async (m, { conn }) => {
  conn.groupAI = conn.groupAI || {}
  if (!m.isGroup || !m.text) return

  const session = conn.groupAI[m.chat]
  if (!session?.enabled) return

  const currentCharacter = getCharacter(session.character || defaultCharacter)
  session.history = session.history || []

  const messages = [
    { role: 'system', content: currentCharacter.prompt },
    ...session.history.map((text, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: text
    })),
    { role: 'user', content: m.text }
  ]

  try {
    const res = await axios.post('https://api.botcahx.eu.org/api/search/openai-custom', {
      message: messages,
      model: session.model || 'gpt-4.1-nano',
      apikey: global.btc
    })

    const reply = res.data?.result
    if (!reply || typeof reply !== 'string') return

    await m.reply(reply)
    session.history = [...session.history, m.text, reply].slice(-10)
  } catch (err) {
    console.error('GrupAutoAI Error:', err)
    await m.reply('⚠️ Terjadi kesalahan saat mengambil jawaban dari AI.')
  }
}

handler.help = ['grupautoai on/off/model/list']
handler.tags = ['group']
handler.command = /^grupautoai$/i
handler.group = true
handler.limit = false

export default handler
