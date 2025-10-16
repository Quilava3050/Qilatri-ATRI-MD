const handler = async (m, { conn }) => {
  const friendlyReplies = [
    "Hai~ 👋 ketik *menu* dulu ya biar aku bisa bantu kamu ✨",
    "Hehe, halo! Coba ketik *menu* biar aku ngerti maumu 😁",
    "Oke, tapi sebelumnya ketik *menu* dulu ya 👍",
    "Aku siap bantuin! Tapi buka *menu* dulu yuk 🤗"
  ]

  const angryReplies = [
    "Hadeh... ketik *menu* dulu napa 😒",
    "Aku bukan cenayang! Ketik *menu* dulu lah 😤",
    "Ngeyel banget sih, ketik *menu* dulu baru bisa kubantu 😑",
    "Udah dibilangin, *menu* dulu! Jangan bikin aku kesel 😡"
  ]

  const replies = Math.random() > 0.5 ? friendlyReplies : angryReplies
  const replyText = pickRandom(replies)

  await conn.sendMessage(m.chat, { text: replyText }, { quoted: m })
}

handler.help = ['bot']
handler.tags = ['main']
handler.customPrefix = /^p$/i  // cuma respon kalau pesannya persis "bot"
handler.command = new RegExp     // biar jalan hanya dari customPrefix

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}