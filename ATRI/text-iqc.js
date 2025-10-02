import fetch from "node-fetch"

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Example :\n.iqc Biji ayam')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    let api = `https://api.botcahx.eu.org/api/maker/iqc?apikey=Quilava&text=${encodeURIComponent(text.trim())}`
    let res = await fetch(api)
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.status) throw json

    await conn.sendMessage(m.chat, {
      image: { url: json.result },
      caption: `✅ Hasil untuk: ${text}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })
  } catch (e) {
    console.error(e)
    m.reply("❌ Terjadi kesalahan, coba lagi nanti.")
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    })
  }
}

handler.help = ['iqc <teks>']
handler.tags = ['text']
handler.command = ['iqc']
handler.limit = true
handler.daftar = true

export default handler