import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, usedPrefix, command }) => {
  console.log('=== toAudio Handler Invoked ===')
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    console.log('Detected mimetype:', mime)
    if (!/video|audio/.test(mime)) throw `Reply Video/Audio dengan caption *${usedPrefix + command}*`

    let media = await q.download()
    if (!media) throw '❌ Gagal download media'
    console.log('Media downloaded, size:', media.length)

    let ran = Date.now()
    let inFile = path.join(__dirname, `../tmp/${ran}.input`)
    let outFile = path.join(__dirname, `../tmp/${ran}.output.opus`)

    await fs.promises.writeFile(inFile, media)

    // convert ke opus dengan parameter yang dioptimalkan untuk WhatsApp
    const ffmpegPath = global.support?.ffmpegPath || 'ffmpeg'
    const ffmpegCommand = `${ffmpegPath} -y -i "${inFile}" -vn -c:a libopus -b:a 48k -ac 1 -ar 48000 -compression_level 10 -frame_duration 60 -application voip "${outFile}"`

    exec(ffmpegCommand, async (err, stdout, stderr) => {
      try { await fs.promises.unlink(inFile) } catch {}
      if (err) {
        console.error('FFmpeg error:', err)
        console.error('stderr:', stderr)
        return conn.reply(m.chat, `❌ Error convert audio!\n\n${stderr || err.message}`, m)
      }

      try {
        let buff = await fs.promises.readFile(outFile)
        console.log('Converted audio size:', buff.length)

        await conn.sendMessage(m.chat, {
          audio: buff,
          mimetype: 'audio/mp4',
          ptt: false,
          seconds: 999999999,
          fileName: 'audio.mp3'
        }, { quoted: m })

        await fs.promises.unlink(outFile)
        console.log('✅ Audio sent successfully & playable in WhatsApp!')
      } catch (e) {
        console.error('Error sending audio:', e)
        conn.reply(m.chat, '❌ Error kirim audio!', m)
      }
    })
  } catch (e) {
    console.error('Handler error:', e)
    throw e
  }
}

handler.help = ['tomp3', 'toaudio']
handler.tags = ['tools']
handler.command = /^to(mp3|a(udio)?)$/i
handler.limit = true
handler.daftar = true

export default handler