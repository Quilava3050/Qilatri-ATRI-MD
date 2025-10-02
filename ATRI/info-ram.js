import os from 'os'

let handler = async (m, { conn }) => {
  let totalStorage = Math.floor(os.totalmem() / 1024 / 1024) + ' MB'
  let freeStorage = Math.floor(os.freemem() / 1024 / 1024) + ' MB'
  let cpuModel = os.cpus()[0].model
  let cpuSpeed = (os.cpus()[0].speed / 1000).toFixed(2)
  let cpuCount = os.cpus().length

  let message = `
*Your Bot Specifications*:

• *Total Storage*: ${totalStorage}
• *Free Storage*: ${freeStorage}
• *CPU Model*: ${cpuModel}
• *CPU Speed*: ${cpuSpeed} GHz
• *Number of CPU Cores*: ${cpuCount}
`.trim()

  await conn.sendMessage(m.chat, {
    text: message,
    contextInfo: {
      externalAdReply: {
        title: "🤖 Bot Specs",
        body: `CPU: ${cpuModel} • RAM: ${totalStorage}`,
        thumbnailUrl: "https://files.catbox.moe/4wyxub.webp",
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['botspec']
handler.tags = ['info']
handler.command = /^(botspec|ram)$/i
handler.daftar = true

export default handler
