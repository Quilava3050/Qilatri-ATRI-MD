import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Cek apakah FFmpeg tersedia
    if (!global.support?.ffmpeg) {
      throw `❌ FFmpeg tidak tersedia!\n\n🔧 Silakan restart bot untuk auto-install FFmpeg\natau install manual:\n• Windows: \`winget install Gyan.FFmpeg\`\n• Linux: \`sudo apt install ffmpeg\`\n• macOS: \`brew install ffmpeg\``
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/audio/.test(mime)) throw `Balas vn/audio dengan caption *${usedPrefix + command}*`
    let audio = await q.download()
    if (!audio) throw '❌ Gagal download audio!'

    // Filter audio sesuai command
    let set
    if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30'
    if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log'
    if (/deep/.test(command)) set = '-af "atempo=0.8,equalizer=f=100:width_type=o:width=2:g=10,volume=1.2"'
    if (/earrape/.test(command)) set = '-af volume=12'
    if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
    if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"'
    if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25'
    if (/reverse/.test(command)) set = '-filter_complex "areverse"'
    if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
    if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
    if (/tupai|squirrel|chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"'
    if (/vibra/.test(command)) set = '-filter_complex "vibrato=f=15"'

    let ran = Date.now()
    let inFile = path.join(__dirname, `../tmp/${ran}.input.mp3`)
    let outFile = path.join(__dirname, `../tmp/${ran}.output.opus`)

    await fs.promises.writeFile(inFile, audio)

    // Command FFmpeg -> output ke opus
    const ffmpegPath = global.support?.ffmpegPath || 'ffmpeg'
    const ffmpegCommand = `${ffmpegPath} -y -i "${inFile}" ${set || ''} -c:a libopus -b:a 128k "${outFile}"`

    exec(ffmpegCommand, async (err, stdout, stderr) => {
      try { await fs.promises.unlink(inFile) } catch {}

      if (err) {
        console.log('FFmpeg error:', err)
        console.log('stderr:', stderr)
        return conn.reply(m.chat, `❌ Error proses audio!\n\n${stderr || err.message}`, m)
      }

      try {
        let buff = await fs.promises.readFile(outFile)
        await conn.sendMessage(m.chat, {
          audio: buff,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true,
          fileName: `${command}.opus`
        }, { quoted: m })

        await fs.promises.unlink(outFile)
      } catch (e) {
        console.log('Error kirim audio:', e)
        conn.reply(m.chat, '❌ Error saat mengirim audio!', m)
      }
    })
  } catch (e) {
    throw e
  }
}

handler.help = [
  'bass', 'blown', 'deep', 'earrape', 'fast', 'fat',
  'nightcore', 'reverse', 'robot', 'slow', 'tupai', 'squirrel', 'chipmunk', 'vibra'
].map(v => v + ' [vn]')

handler.tags = ['voice']
handler.command = /^(bass|blown|deep|earrape|fas?t|fat|nightcore|reverse|robot|slow|tupai|squirrel|chipmunk|vibra)$/i

export default handler