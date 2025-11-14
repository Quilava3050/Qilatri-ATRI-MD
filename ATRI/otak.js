// ATRI/ai-smart.js

let handler = async (m, { conn }) => {
  try {
    let text = m.text?.toLowerCase()
    if (!text) return
    if (!text.includes('atri')) return // aktif kalau disebut 'atri'

    // pastikan ga ganggu command prefix
    if (global.prefix && m.text.match(global.prefix)) return

    // daftar keyword → nama plugin / command
    const keywordMap = [
      { keys: ['musik', 'lagu', 'nyanyi', 'putar'], command: 'play' },
      { keys: ['berita', 'kabar'], command: 'news' },
      { keys: ['cuaca', 'weather', 'hujan', 'panas'], command: 'cuaca' },
    ]

    // cari keyword yang cocok
    let foundCmd = null
    for (let map of keywordMap) {
      if (map.keys.some(k => text.includes(k))) {
        foundCmd = map.command
        break
      }
    }

    if (!foundCmd) {
      await m.reply('🤔 Aku belum ngerti maksudmu, coba bilang "atri musik" atau "atri cuaca jakarta"')
      return
    }

    // ambil plugin dari global.ATRI sesuai command
    const plugin = global.ATRI
      ? Object.values(global.ATRI).find(p =>
          p?.command instanceof RegExp ? p.command.test(foundCmd) : p.command === foundCmd
        )
      : null

    if (!plugin || typeof plugin.handler !== 'function') {
      await m.reply(`❌ Plugin untuk *${foundCmd}* belum ditemukan.`)
      return
    }

    // ambil query pengguna
    const query = text
      .replace(/atri|tolong|cariin|dong|musik|lagu|nyanyi|berita|kabar|cuaca|weather|putar|hujan|panas/gi, '')
      .trim()

    // panggil plugin yang sesuai
    await plugin.handler(m, { conn, text: query, command: foundCmd })
  } catch (e) {
    console.error(e)
    await m.reply(`❌ Error di ai-smart.js:\n${e.message}`)
  }
}

handler.help = ['brain']
handler.tags = ['ai']
handler.command = /^$/i
handler.daftar = false

export default handler