import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, args, command, text }) => {
  if (!text) throw `Linknya Mana?, Example: ${usedPrefix + command} https://vt.tiktok.com/ZSFd1yn9j/`
  m.reply(wait)

  let api = `https://api.vreden.my.id/api/tikmusic?url=${encodeURIComponent(text)}`
  let res = await fetch(api)
  if (!res.ok) throw 'Gagal mengambil data dari API.'
  let json = await res.json()

  if (json.status !== 200 || !json.result) throw 'Gagal mengambil data audio dari Tiktok.'

  let result = json.result
  let caption = `乂 *T I K  T O K*\n♮ *Username:* ${result.author}\n♮ *Description:* ${result.title}\n• _Sukses menemukan data, Harap tunggu sedang mendownload audionya_\n`

  let msg = await conn.sendMessage(m.chat, {
    text: caption
  }, { quoted: m })

  await conn.sendMessage(m.chat, {
    audio: { url: result.url },
    mimetype: 'audio/mpeg',
    fileName: `${result.title}.mp3`,
    ptt: false
  }, { quoted: msg })
}

handler.help = ['tiktokmp3']
handler.tags = ['downloader']
handler.command = /^(tiktokmp3|ttmp3)$/i
handler.limit = true
handler.daftar = true

export default handler