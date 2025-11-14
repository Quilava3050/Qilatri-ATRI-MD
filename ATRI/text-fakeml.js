import { createCanvas, loadImage, registerFont } from 'canvas'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const WEBFONT_FAMILY = 'Anton'
const WEBFONT_CSS = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(WEBFONT_FAMILY)}:wght@400&display=swap`

async function fetchFontFromGoogle(destDir) {
  const cssRes = await axios.get(WEBFONT_CSS, { timeout: 15000 })
  const match = cssRes.data.match(/url\((https:[^)]+)\) format\('woff2'\)/)
  if (!match) throw new Error('Font URL not found in CSS')
  const fontUrl = match[1]
  const ext = path.extname(new URL(fontUrl).pathname) || '.woff2'
  const fileName = `${WEBFONT_FAMILY.replace(/\s+/g, '_')}${ext}`
  const dest = path.join(destDir, fileName)
  if (!fs.existsSync(dest)) {
    const res = await axios.get(fontUrl, { responseType: 'arraybuffer', timeout: 20000 })
    fs.writeFileSync(dest, Buffer.from(res.data))
  }
  try {
    registerFont(dest, { family: 'CustomFont' })
    return { ok: true, family: 'CustomFont', path: dest }
  } catch {
    return { ok: false, family: 'sans-serif' }
  }
}

let handler = async (m, { conn, text }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) return m.reply('Mana gambarnya')
  if (!text) return m.reply('Masukin nickname dulu, contoh: .fakeml Owen')
  m.reply('Wait...')
  const tmpDir = process.cwd()
  try {
    const fontResult = await fetchFontFromGoogle(tmpDir).catch(() => ({ ok: false, family: 'sans-serif' }))
    const mediaBuffer = await q.download()
    const userImage = await loadImage(mediaBuffer)
    const bg = await loadImage('https://files.catbox.moe/liplnf.jpg')
    const frameOverlay = await loadImage('https://files.catbox.moe/2vm2lt.png')
    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)
    const avatarSize = 205
    const frameSize = 293
    const centerX = (canvas.width - frameSize) / 2
    const centerY = (canvas.height - frameSize) / 2 - 282
    const avatarX = centerX + (frameSize - avatarSize) / 2
    const avatarY = centerY + (frameSize - avatarSize) / 2 - 3
    const { width, height } = userImage
    const minSide = Math.min(width, height)
    const cropX = (width - minSide) / 2
    const cropY = (height - minSide) / 2
    ctx.drawImage(userImage, cropX, cropY, minSide, minSide, avatarX, avatarY, avatarSize, avatarSize)
    ctx.drawImage(frameOverlay, centerX, centerY, frameSize, frameSize)
    const nickname = text.trim()
    const maxFontSize = 36
    const minFontSize = 24
    const maxChar = 11
    let fontSize = maxFontSize
    if (nickname.length > maxChar) {
      const excess = nickname.length - maxChar
      fontSize -= excess * 2
      if (fontSize < minFontSize) fontSize = minFontSize
    }
    const family = fontResult.family || 'sans-serif'
    ctx.font = `${fontSize}px "${family}"`
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    const textX = canvas.width / 2 + 13
    const textY = centerY + frameSize + 15
    const metrics = ctx.measureText(nickname)
    const maxWidth = frameSize + 60
    let drawName = nickname
    if (metrics.width > maxWidth) {
      for (let len = nickname.length; len > 0; len--) {
        const sub = nickname.slice(0, len) + '…'
        if (ctx.measureText(sub).width <= maxWidth) {
          drawName = sub
          break
        }
      }
    }
    ctx.fillText(drawName, textX, textY)
    const buffer = canvas.toBuffer('image/png')
    await conn.sendMessage(m.chat, { image: buffer, caption: 'Done' }, { quoted: m })
  } catch (e) {
    m.reply('Terjadi error saat membuat gambar: ' + (e.message || e.toString()))
  }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['text']
handler.command = /^fakeml$/i
handler.daftar = true
handler.limit = true

export default handler