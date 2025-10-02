let handler = async (m, { conn, text, command }) => {
  if (!text) throw 'Teksnya?'

  await conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  })

  let teks = encodeURIComponent(text)
  let url

  if (command === 'ttp') {
    url = `https://api.lolhuman.xyz/api/ttp?apikey=${lolkey}&text=${teks}`
  } else if (command === 'attp') {
    url = `https://api.betabotz.eu.org/api/maker/attp?text=${teks}&apikey=${lann}`
  } else {
    throw 'Perintah tidak dikenali.'
  }

  try {
    await conn.sendFile(m.chat, url, 'sticker.webp', '', m, { asSticker: true })
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, 'Gagal mengambil stiker.', m)
  }
}

handler.help = ['ttp', 'attp']
handler.tags = ['sticker']
handler.command = /^(ttp|attp)$/i
handler.limit = true
handler.premium = false
handler.daftar = true

export default handler