import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn }) => {
    if (!/^https?:\/\//.test(text)) throw 'Awali *URL* dengan http:// atau https://'
    
    let _url = new URL(text)
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY')

    let res = await fetch(url)
    let contentLength = parseInt(res.headers.get('content-length') || '0', 10)
    
    if (contentLength > 100 * 1024 * 1024) { 
        throw `Content-Length: ${contentLength}`
    }

    if (!/text|json/.test(res.headers.get('content-type'))) {
        return conn.sendFile(m.chat, url, 'file', text, m)
    }

    let arrayBuffer = await res.arrayBuffer() // Mengambil data sebagai ArrayBuffer
    let buffer = Buffer.from(arrayBuffer) // Mengubah ArrayBuffer menjadi Buffer
    let txt = buffer.toString() // Konversi buffer ke string

    try {
        txt = format(JSON.parse(txt))
    } catch (e) {
        // Jika gagal parse JSON, gunakan teks mentah
    }
    
    m.reply(txt.slice(0, 65536))
}

handler.help = ['fetch', 'get']
handler.tags = ['tools']
handler.command = /^(fetch|get)$/i
handler.limit = true
handler.daftar = true

export default handler