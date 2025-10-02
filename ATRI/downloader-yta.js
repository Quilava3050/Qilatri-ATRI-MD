const yt = {
  get baseUrl() {
    return { origin: 'https://ssvid.net' }
  },
  get baseHeaders() {
    return {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'origin': this.baseUrl.origin,
      'referer': this.baseUrl.origin + '/youtube-to-mp3'
    }
  },
  validateFormat(userFormat) {
    if (userFormat !== 'mp3') throw Error(`invalid format! hanya support mp3`)
  },
  handleFormat(userFormat, searchJson) {
    this.validateFormat(userFormat)
    const result = searchJson.links?.mp3?.mp3128?.k
    if (!result) throw Error(`format mp3 gak ada`)
    return result
  },
  hit: async function(path, payload) {
    try {
      const body = new URLSearchParams(payload)
      const r = await fetch(`${this.baseUrl.origin}${path}`, { method: 'POST', headers: this.baseHeaders, body })
      if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
      return await r.json()
    } catch (e) {
      throw Error(`${path}\n${e.message}`)
    }
  },
  download: async function(queryOrYtUrl) {
    let search = await this.hit('/api/ajax/search', { query: queryOrYtUrl, cf_token:'', vt:'youtube' })
    if (search.p=='search') {
      if (!search?.items?.length) throw Error(`hasil pencarian ${queryOrYtUrl} tidak ada`)
      const { v } = search.items[0]
      const videoUrl = 'https://www.youtube.com/watch?v='+v
      search = await this.hit('/api/ajax/search', { query: videoUrl, cf_token:'', vt:'youtube' })
    }
    const vid = search.vid
    const k = this.handleFormat('mp3', search)
    const convert = await this.hit('/api/ajax/convert', { k, vid })
    if (convert.c_status=='CONVERTING') {
      let convert2
      const limit = 5
      let attempt = 0
      do {
        attempt++
        convert2 = await this.hit('/api/convert/check?hl=en', { vid, b_id: convert.b_id })
        if (convert2.c_status=='CONVERTED') return convert2
        await new Promise(r=>setTimeout(r,5000))
      } while (attempt<limit && convert2.c_status=='CONVERTING')
      throw Error('file belum siap / status belum diketahui')
    } else return convert
  }
}

let handler = async (m, { text, conn }) => {
  try {
    if (!text) throw Error('masukin url youtube')

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const res = await yt.download(text)
    await conn.sendMessage(
      m.chat,
      { audio: { url: res.dlink }, mimetype: 'audio/mpeg', ptt: false },
      { quoted: m }
    )
  } catch (err) {
    m.reply(`Eror kak : ${err.message}`)
  }
}

handler.tags = ['downloader'];
handler.help = ['ytmp3'];
handler.command = /^(ytmp3|yta)$/i;
handler.limit = true;

export default handler;