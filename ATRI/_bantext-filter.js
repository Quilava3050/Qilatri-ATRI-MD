export async function before(m, { conn }) {
  if (!m.text) return
  for (let banned of global.bannedTexts) {
    if (m.text.toLowerCase().includes(banned.toLowerCase())) {
      try {
        await conn.sendMessage(m.chat, { delete: m.key }) // hapus pesan
        await conn.sendMessage(m.chat, { react: { text: '🚫', key: m.key } }) // kasih react
      } catch (e) {
        console.error(e)
      }
    }
  }
}