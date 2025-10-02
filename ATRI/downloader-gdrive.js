import fetch from 'node-fetch'
import { sizeFormatter } from 'human-readable'
let formatSize = sizeFormatter({
  std: 'JEDEC', decimalPlaces: 2, keepTrailingZeroes: false, render: (literal, symbol) => `${literal} ${symbol}B`
})

let handler = async (m, { conn, args, command }) => {
  if (!args[0]) throw `Masukkan URL Google Drive!\n\nContoh:\n.${command} https://drive.google.com/file/d/1n7a0nG4KxRXivK6Xn2rY1rUkd1Yxxxx/view`

  m.reply(wait)

  try {
    GDriveDl(args[0]).then(async (res) => {
      if (!res) throw res

      let caption = `
*「 GDRIVE DOWNLOADER 」*

⭔ *Nama:* ${res.fileName}
⭔ *Ukuran:* ${res.fileSize}
⭔ *Mime:* ${res.mimetype}
⭔ *Status:* ✅ Berhasil Diunduh

_by matstoree_
`.trim()

      conn.sendMessage(m.chat, {
        document: { url: res.downloadUrl },
        mimetype: res.mimetype,
        caption
      }, { quoted: m })

    })
  } catch (e) {
    m.reply(eror)
  }
}

handler.help = ['gdrive']
handler.tags = ['downloader']
handler.command = /^(gdrive)$/i
handler.limit = true
handler.daftar = true

export default handler

async function GDriveDl(url) {
  let id
  if (!(url && url.match(/drive\.google/i))) throw 'URL Google Drive tidak valid!'
  id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
  if (!id) throw 'Gagal mengambil ID dari URL'

  let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'post',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'content-length': 0,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'origin': 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested': 'true'
    }
  })

  let { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
  if (!downloadUrl) throw 'Link download terkena limit!'

  let data = await fetch(downloadUrl)
  if (data.status !== 200) throw data.statusText

  return {
    downloadUrl,
    fileName,
    fileSize: formatSize(sizeBytes),
    mimetype: data.headers.get('content-type')
  }
}