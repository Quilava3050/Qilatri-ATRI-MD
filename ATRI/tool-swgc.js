import baileys from '@whiskeysockets/baileys'
import crypto from 'crypto'
import { PassThrough } from 'stream'
import ffmpeg from 'fluent-ffmpeg'

let handler = async (m, { conn, text }) => {
  if (!text && !m.quoted) return m.reply(`⚠️ Contoh: .upswgc text|warna|link atau reply media!`)

  let [textInput, warna, url] = text ? text.split('|') : ['', '', '']
  let id

  // ambil id grup (dari link atau chat sekarang)
  if (url) {
    try {
      const inviteCode = url.split('/').pop().split('?')[0]
      let info = await conn.groupGetInviteInfo(inviteCode)
      id = info.id
    } catch {
      return m.reply('⚠️ Link undangan tidak valid!')
    }
  } else {
    id = m.chat
  }

  let quoted = m.quoted || m
  let cap = quoted.caption || textInput || ''
  let mime = quoted.mimetype || quoted.msg?.mimetype || ''

  // ==== [MEDIA] ====
  if (/image/.test(mime)) {
    const buffer = await quoted.download()
    if (!buffer) return m.reply('⚠️ Gagal ambil gambar!')
    return sendGroupStatus(conn, id, { image: buffer, caption: cap }, m)
  }

  if (/video/.test(mime)) {
    const buffer = await quoted.download()
    if (!buffer) return m.reply('⚠️ Gagal ambil video!')
    return sendGroupStatus(conn, id, { video: buffer, caption: cap }, m)
  }

  if (/audio/.test(mime)) {
    const buffer = await quoted.download()
    if (!buffer) return m.reply('⚠️ Gagal ambil audio!')
    const vn = await toVN(buffer)
    const waveform = await generateWaveform(buffer)
    return sendGroupStatus(conn, id, {
      audio: vn,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      waveform
    }, m)
  }

  // ==== [TEXT BERWARNA] ====
  if (warna) {
    const warnaWA = {
      biru: '#34B7F1', hijau: '#25D366', kuning: '#FFD700', jingga: '#FF8C00',
      merah: '#FF3B30', ungu: '#9C27B0', abu: '#9E9E9E', hitam: '#000000',
      putih: '#FFFFFF', cyan: '#00BCD4'
    }

    let selected = Object.entries(warnaWA).find(([n]) => warna.toLowerCase().includes(n))
    if (!selected) return m.reply('⚪ Warna tidak dikenali!')

    return sendGroupStatus(conn, id, {
      text: cap || textInput || '',
      backgroundColor: selected[1]
    }, m)
  }

  return m.reply('⚠️ Reply media (gambar/video/audio) atau kirim teks + warna!')
}

handler.help = ['swgc', 'upswgc']
handler.tags = ['tools']
handler.command = /^(swgc|upswgc)$/i
handler.admin = true

export default handler

// ==== Fungsi bantu ====

async function sendGroupStatus(conn, jid, content, m) {
  try {
    const msg = await baileys.generateWAMessageFromContent(jid, {
      messageContextInfo: { messageSecret: crypto.randomBytes(32) },
      groupStatusMessageV2: {
        message: {
          ...await baileys.generateWAMessageContent(content, { upload: conn.waUploadToServer })
        }
      }
    }, {})

    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id })
    await conn.reply(m.chat, '✅ Status berhasil diupload ke grup!', m)
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengirim status ke grup.')
  }
}

async function toVN(buffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough()
    const chunks = []
    inStream.end(buffer)

    ffmpeg(inStream)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions(['-map_metadata', '-1', '-application', 'voip', '-compression_level', '10'])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe()
      .on('data', c => chunks.push(c))
  })
}

async function generateWaveform(buffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const input = new PassThrough()
    input.end(buffer)
    const chunks = []

    ffmpeg(input)
      .audioChannels(1)
      .audioFrequency(16000)
      .format('s16le')
      .on('error', reject)
      .on('end', () => {
        const raw = Buffer.concat(chunks)
        const samples = raw.length / 2
        const amps = Array(samples).fill(0).map((_, i) => Math.abs(raw.readInt16LE(i * 2)) / 32768)
        const block = Math.floor(amps.length / bars)
        const avg = Array(bars).fill(0).map((_, i) =>
          amps.slice(i * block, (i + 1) * block).reduce((a, b) => a + b, 0) / block)
        const max = Math.max(...avg)
        const norm = avg.map(v => Math.floor((v / max) * 100))
        resolve(Buffer.from(new Uint8Array(norm)).toString('base64'))
      })
      .pipe()
      .on('data', chunk => chunks.push(chunk))
  })
}