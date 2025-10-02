import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Contoh:\n.${command} https://youtube.com/watch?v=ID`

  const url = text.trim()
  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) throw 'URL tidak valid. Gunakan URL YouTube.'

  await m.reply('*⏳ Mengambil video.....*')

  try {
    const data = await vredenYtMp4(url)
    if (!data?.downloadUrl) throw 'Gagal mendapatkan link video.'

    const title = data.title || 'YouTube Video'
    const q = data.quality || '720p'
    const caption = `
乂  *Y T - M P 4*

   ⭔  *Title* : ${title}
   ⭔  *Quality* : ${q}
   ⭔  *Durasi* : ${data.duration}
   ⭔  *Channel* : ${data.author}

${global.wm}
    `.trim()

    await conn.sendMessage(m.chat, {
      video: { url: data.downloadUrl },
      mimetype: 'video/mp4',
      fileName: `${sanitizeFilename(title)}_${q}.mp4`,
      caption,
      thumbnail: await (await fetch(data.thumbnail)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan, coba lagi nanti.')
  }
}

handler.command = /^yt(mp4|video)$/i
handler.tags = ['downloader']
handler.help = ['ytmp4 <url>']
handler.limit = true
handler.daftar = true

export default handler

const vredenYtMp4 = async (url) => {
  const endpoint = `https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(url)}`
  const r = await fetch(endpoint, { method: 'GET', headers: { accept: 'application/json' } })
  if (!r.ok) {
    const txt = await r.text().catch(() => null)
    throw Error(`fetch failed: ${r.status} ${r.statusText}\n${txt || ''}`)
  }
  const json = await r.json()
  const res = json.result
  if (!res?.metadata || !res?.download) throw Error('Invalid API response')

  return {
    title: res.metadata.title,
    author: res.metadata.author?.name,
    duration: res.metadata.duration?.timestamp,
    thumbnail: res.metadata.thumbnail,
    views: res.metadata.views,
    ago: res.metadata.ago,
    quality: res.download.quality,
    downloadUrl: res.download.url,
    filename: res.download.filename
  }
}

function sanitizeFilename(name = 'video') {
  return name.replace(/[\\/:*?"<>|]+/g, '').slice(0, 100)
}