const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { text, conn, command }) => {
  if (!text) throw `🚫 Masukkan IP atau domain!\n\nContoh:\n.${command} 1.1.1.1\n.${command} google.com`

  const target = text
  const steps = [
    `💥 Memulai serangan DDoS ke ${target}...`,
    `⏳ Menyiapkan botnet global...`,
    `🛰️ Terhubung ke 256 node internasional...`,
    `⚙️ Mengeksekusi script DDoS tingkat dewa...`,
    `📡 Mengirim 500.000 paket/s ke ${target}...`,
    `💣 Firewall target berhasil ditembus!`,
    `📊 Server ${target} mulai overload...`,
    `🔥 Server ${target} berhasil down!`,
    `🥳 DDoS Sukses besar...`,
    `🤫 Tapi boong 😜`
  ]

  for (const line of steps) {
    await m.reply(line)
    await delay(1500)
  }
}

handler.help = ['ddos <ip/domain>']
handler.tags = ['fun', 'tools']
handler.command = /^ddos$/i

export default handler