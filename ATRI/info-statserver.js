import cp from 'child_process'
import { promisify } from 'util'
import os from 'os'
import moment from 'moment-timezone'

let exec = promisify(cp.exec).bind(cp)

let handler = async (m, { conn }) => {
  await conn.reply(m.chat, "⏳ Sedang mengecek status server...", m)

  let o
  try {
    o = await exec('df -h') // cek disk usage
  } catch (e) {
    o = e
  }

  let { stdout, stderr } = o
  let disk = stdout.trim() ? stdout : stderr

  // Ambil info tambahan server
  const uptime = os.uptime()
  const uptimeStr = clockString(uptime * 1000)
  const cpuModel = os.cpus()[0].model
  const cpuCores = os.cpus().length
  const loadAvg = os.loadavg().map(v => v.toFixed(2)).join(', ')
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
  const usedMem = (totalMem - freeMem).toFixed(2)
  const memPercent = ((usedMem / totalMem) * 100).toFixed(2)

  const time = moment().tz('Asia/Jakarta').format('dddd, DD MMMM YYYY HH:mm:ss')

  const caption = `
🖥️ *SERVER STATUS*

📆 Waktu : ${time}
⏱️ Uptime : ${uptimeStr}

💾 *Disk Usage*
\`\`\`
${disk}
\`\`\`

⚙️ *CPU Info*
• Model   : ${cpuModel}
• Cores   : ${cpuCores}
• LoadAvg : ${loadAvg}

📊 *Memory*
• Digunakan : ${usedMem} GB
• Tersisa   : ${freeMem} GB
• Total     : ${totalMem} GB
• Persen    : ${memPercent} %
`.trim()

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: "📡 Informasi Server",
        body: `CPU: ${cpuModel} (${cpuCores} cores) • RAM: ${usedMem}/${totalMem} GB`,
        thumbnailUrl: "https://i.ibb.co/n1d1Bjq/server-status.jpg", // thumbnail custom
        sourceUrl: "https://quickchart.io", // bisa diarahkan ke link panel/server kamu
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['server']
handler.tags = ['info']
handler.command = /^(server)$/i
handler.daftar = true

export default handler

function clockString(ms) {
  if (isNaN(ms)) return '-- Hari -- Jam -- Menit -- Detik'
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms % 86400000 / 3600000)
  let m = Math.floor(ms % 3600000 / 60000)
  let s = Math.floor(ms % 60000 / 1000)
  return `${d > 0 ? d + ' Hari ' : ''}${h.toString().padStart(2, '0')} Jam ${m.toString().padStart(2, '0')} Menit ${s.toString().padStart(2, '0')} Detik`
}
