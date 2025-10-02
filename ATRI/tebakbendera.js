import fetch from 'node-fetch'

const countries = [
  { name: "Indonesia", flag: "https://flagcdn.com/w320/id.png" },
  { name: "Jepang", flag: "https://flagcdn.com/w320/jp.png" },
  { name: "Brazil", flag: "https://flagcdn.com/w320/br.png" },
  { name: "Amerika Serikat", flag: "https://flagcdn.com/w320/us.png" },
  { name: "India", flag: "https://flagcdn.com/w320/in.png" },
  { name: "Prancis", flag: "https://flagcdn.com/w320/fr.png" },
  { name: "Jerman", flag: "https://flagcdn.com/w320/de.png" },
  { name: "Italia", flag: "https://flagcdn.com/w320/it.png" },
  { name: "Korea Selatan", flag: "https://flagcdn.com/w320/kr.png" },
  { name: "Malaysia", flag: "https://flagcdn.com/w320/my.png" }
]

const handler = async (m, { conn, usedPrefix, command }) => {
  conn.tebakbendera = conn.tebakbendera || {}
  if (conn.tebakbendera[m.sender]) return m.reply('❗ Kamu masih punya soal yang belum dijawab!')

  let random = countries[Math.floor(Math.random() * countries.length)]
  let timeout = 30000

  conn.tebakbendera[m.sender] = {
    jawab: random.name.toLowerCase(),
    status: true,
    timeout: setTimeout(() => {
      if (conn.tebakbendera[m.sender]) {
        m.reply(`⏰ Waktu habis!
Jawabannya adalah: *${random.name}*`)
        delete conn.tebakbendera[m.sender]
      }
    }, timeout)
  }

  await conn.sendFile(m.chat, random.flag, 'flag.jpg', `🌍 Tebak bendera negara apa ini?

🕒 *Waktu:* 30 detik
✏️ Jawab dengan cara ketik nama negaranya.`, m)
}

handler.before = async (m, { conn }) => {
  conn.tebakbendera = conn.tebakbendera || {}
  const game = conn.tebakbendera[m.sender]
  if (!game || !game.status) return

  const answer = m.text.trim().toLowerCase()
  if (answer === game.jawab) {
    clearTimeout(game.timeout)
    await m.reply(`✅ Benar! Itu adalah *${game.jawab.charAt(0).toUpperCase() + game.jawab.slice(1)}* 🥳`)
    delete conn.tebakbendera[m.sender]
  } else {
    // tidak ada respon jika salah, biar tidak spam
  }
}

handler.help = ['tebakbendera']
handler.tags = ['game']
handler.command = /^tebakbendera$/i
handler.limit = false

export default handler