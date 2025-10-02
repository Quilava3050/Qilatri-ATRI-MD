// file: owner-setprefix-silent.js

let handler = async (m, { text, isOwner }) => {
  if (!isOwner) return
  if (!text) return

  // Update prefix global
  global.prefix = new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)

  // Tulis info ke console
  console.log(`✅ Prefix berhasil diganti jadi: ${text}`)
}
handler.command = /^silentsetprefix$/i
handler.owner = true

export default handler