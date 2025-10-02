let handler = async (m, { conn, args, command }) => {
  if (!args[0]) throw `🚫 URL-nya mana?\n\nContoh:\n${command} https://youtu.be/VIDEO_ID`

  const url = args[0]

  if (!url.match(/(youtu.be|youtube.com)/gi)) {
    throw `🚫 URL tidak valid!\nPastikan itu adalah link YouTube yang benar.`
  }

  try {
    const api = `https://api-02.ryzumi.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}&quality=360`
    const res = await fetch(api)
    if (!res.ok) throw '❌ Gagal menghubungi server API.'

    const json = await res.json()
    if (!json.url) throw '❌ Gagal mendapatkan link video.'

    const seconds = Number(json.lengthSeconds)
    const formatDuration = sec => {
      const m = Math.floor(sec / 60)
      const s = sec % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    }

    const sizeMB = ((seconds / 60) * 1.1).toFixed(2) // Estimasi 1.1MB/menit @360p

    await conn.sendMessage(m.chat, {
      image: { url: json.thumbnail },
      caption: `乂  *D O W N L O A D  -  M P 4*\n
   ⭔  *Judul* : ${json.title}
   ⭔  *Channel* : ${json.author}
   ⭔  *Durasi* : ${formatDuration(seconds)}
   ⭔  *Ukuran* : ${sizeMB} MB
   ⭔  *Views* : ${json.views}
   ⭔  *Upload* : ${json.uploadDate}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      video: { url: json.url },
      caption: json.title
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '⚠️ Terjadi kesalahan saat mengambil video.'
  }
}

handler.command = /^tes$/i
handler.tags = ['downloader']
handler.help = ['ytmp4 <url>']
handler.limit = true
handler.daftar = true

export default handler