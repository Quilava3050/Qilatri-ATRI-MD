import os from 'os'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // React cepat (tanpa await)
    conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } }).catch(() => {})

    let userData = global.db?.data?.users[m.sender] || {}
    let nama = userData.nama || m.pushName || 'PENGGUNA'
    let exp = userData.exp || 0
    let koin = userData.koin || 0
    let limit = userData.limit || 0

    // reset premium kalau sudah habis
    if (userData.premium && Number(userData.premiumTime || 0) <= Date.now()) {
      userData.premium = false
      userData.premiumTime = 0
    }

    let isOwner = Array.isArray(global.owner) ? global.owner.some(([id]) => m.sender.includes(id)) : false
    let isPremium = userData.premium === true && Number(userData.premiumTime || 0) > Date.now()
    let status = isOwner ? 'Owner👑' : isPremium ? 'Premium💎' : 'Free User'
    let sisaPremium = isPremium ? getRemainingTime(userData.premiumTime - Date.now()) : '-'

    let now = new Date()
    let locale = 'id'
    let hari = now.toLocaleDateString(locale, { weekday: 'long', timeZone: 'Asia/Jakarta' })
    let tanggal = now.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
    let uptime = clockString(process.uptime() * 1000)

    // ukuran database
    let dbSize = (() => {
      try {
        let stats = fs.statSync('./database.json')
        return formatBytes(stats.size)
      } catch {
        return 'Tidak tersedia'
      }
    })()

    // ================================
    //  INFO PANEL BOT
    // ================================
    let infoBot = `
┏━━━ *INFO BOT* ━━━┓
┃  Nama Bot   : ${global.namebot}
┃  Prefix     : ${_p}
┃  Platform   : ${os.platform()}
┃  Uptime     : ${uptime}
┃  Tanggal    : ${hari}, ${tanggal}
┃  Pengguna   : ${Object.keys(global.db?.data?.users || {}).length}
┃  Database   : ${dbSize}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`.trim()

    // ================================
    //  PROFIL PENGGUNA
    // ================================
    let infoUser = `
┏━━━ *PROFIL ANDA* ━━━┓
┃  Nama     : ${nama}
┃  Status   : ${status}
┃  Exp      : ${exp}
┃  Koin     : ${koin}
┃  Limit    : ${limit}
┃  Premium  : ${sisaPremium}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`.trim()

    // ================================
    //  MENU COMMANDS
    // ================================
    let help = Object.values(global.ATRI || {})
      .filter(plugin => plugin && !plugin.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        owner: plugin.owner,
        rowner: plugin.rowner
      }))

    let categories = {}
    help.forEach(plugin => {
      plugin.tags.forEach(tag => {
        if (!(tag in categories) && tag) categories[tag] = tag
      })
    })

    let allMenu = Object.keys(categories)
      .map(tag => {
        let cmds = help
          .filter(menu => menu.tags.includes(tag) && menu.help)
          .map(menu => menu.help.map(cmd => {
            let marks = ''
            if (menu.limit) marks += 'Ⓛ '
            if (menu.premium) marks += 'Ⓟ '
            if (menu.owner || menu.rowner) marks += 'Ⓞ '
            return `┃ ${menu.prefix ? cmd : `${_p}${cmd}`} ${marks}`.trim()
          }).join('\n')).join('\n')

        return `
┏━━━🔹 *${tag.toUpperCase()}* 🔹━━━┓
${cmds}
┗━━━━━━━━━━━━━━━━━━━━━━━┛
`.trim()
      }).join('\n\n')

    // ================================
    //  FINAL OUTPUT
    // ================================
    let fullMenu = `
❖ 「 *${getGreeting()}, ${nama}!* ini adalah daftar dari seluruh fitur ATRI AI ASSISTANT 」 ❖

${infoBot}

${infoUser}

${allMenu}

╰───❖ ${global.wm || 'Atri AI Assistant'} ❖───╯
`.trim()

    // pengiriman pesan
    await conn.sendMessage(m.chat, {
      image: { url: global.fotonya },
      caption: fullMenu
    }, { quoted: m })

    // React selesai (tanpa await)
    conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})

  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    m.reply('⚠️ Terjadi kesalahan saat menampilkan menu.')
  }
}

handler.help = ['allmenu']
handler.tags = ['main']
handler.command = /^(allmenu)$/i
handler.daftar = true
export default handler

// =============================
//  FUNGSI BANTUAN
// =============================
function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function getGreeting() {
  let d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  let hour = new Date(d).getHours()
  if (hour >= 4 && hour < 10) return 'Selamat pagi'
  if (hour >= 10 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function getRemainingTime(ms) {
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms / 3600000) % 24
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return `${d}h ${h}j ${m}m ${s}d`
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  let units = ['KB', 'MB', 'GB']
  let i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i - 1]
}