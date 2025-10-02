import fs from 'fs'

// Footer global (tinggal edit ini kalau mau ganti semua footer)

// Konfigurasi media menu
global.fotonya = 'https://files.catbox.moe/nxvt5v.jpg'
global.videonya = 'https://files.catbox.moe/5b6fsx.mp4'
global.useVideoMenu = true // true = video, false = foto
global.footerText = `⚡ ${global.namebot} • Powered by ${global.ownerName || 'Natsuki Minamo'} ⚡`

let handler = async (m, { conn, usedPrefix: _p, args, command }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🍃', key: m.key } })

    // Data user
    let userData = global.db?.data?.users?.[m.sender] || {}
    let nama = userData.nama || m.pushName || 'PENGGUNA'
    let exp = userData.exp || 0
    let koin = userData.koin || 0
    let limit = userData.limit || 0

    if (userData.premium && Number(userData.premiumTime || 0) <= Date.now()) {
      userData.premium = false
      userData.premiumTime = 0
    }

    let senderNum = m.sender.split('@')[0]
    let isOwner = Array.isArray(global.owner)
      ? global.owner.some(([id]) => String(id) === senderNum)
      : false

    let isPremium = userData.premium === true && Number(userData.premiumTime || 0) > Date.now()
    let status = isOwner ? 'Pemilik' : isPremium ? 'Premium' : 'Free User'
    let sisaPremium = isOwner ? 'Permanen' : (isPremium ? getRemainingTime(userData.premiumTime - Date.now()) : '-')

    const { tanggal, waktu } = waktuJakarta()

    let menuUser = `
┏━━ ⪩  INFO PENGGUNA  ⪨
┃ ⬡ Nama    : ${nama}
┃ ⬡ Status  : ${status}
┃ ⬡ Exp     : ${exp}
┃ ⬡ Koin    : ${koin}
┃ ⬡ Limit   : ${limit}
┃ ⬡ Premium : ${sisaPremium}
┃ ⬡ Tanggal : ${tanggal}
┃ ⬡ Waktu   : ${waktu} WIB
┗━━━━━━━━━━━━━━━⟢
`.trim()

    // Data semua perintah
    let help = Object.values(global.ATRI)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help.filter(Boolean) : [p.help].filter(Boolean),
        tags: Array.isArray(p.tags) ? p.tags.filter(Boolean) : [p.tags].filter(Boolean),
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
        owner: p.owner,
        rowner: p.rowner
      }))

    let categories = {}
    help.forEach(ATRI => {
      ATRI.tags.forEach(tag => {
        if (tag && !(tag in categories)) categories[tag] = tag
      })
    })

    // Kalau pilih kategori
    if (args[0]) {
      let category = args[0].toLowerCase()
      if (category in categories) {
        let commands = help
          .filter(menu => menu.tags.map(t => String(t).toLowerCase()).includes(category) && menu.help?.length)
          .map(menu => menu.help.map(cmd => {
            let marks = ''
            if (menu.limit) marks += 'Ⓛ '
            if (menu.premium) marks += 'Ⓟ '
            if (menu.owner || menu.rowner) marks += 'Ⓞ '
            return `• ${menu.prefix ? cmd : `${_p}${cmd}`} ${marks}`.trim()
          }).join('\n')).join('\n')

        let menuContent = `
乂  MENU ${category.toUpperCase()}
┏━━━━━━━━━━⟢
${commands || 'Belum ada perintah.'}
┗━━━━━━━━━━⟢
`.trim()

        if (global.useVideoMenu) {
          await conn.sendMessage(m.chat, {
            video: { url: global.videonya },
            gifPlayback: true,
            caption: `${ucapan()} @${senderNum} ini adalah isi dari menu ${category} yang kamu pilih.

${menuContent}`,
            footer: global.footerText,
            mentions: [m.sender]
          }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, {
            image: { url: global.fotonya },
            caption: `${ucapan()} @${senderNum} ini adalah isi dari menu ${category} yang kamu pilih.

${menuContent}`,
            footer: global.footerText,
            mentions: [m.sender]
          }, { quoted: m })
        }
        return
      } else {
        await conn.reply(m.chat, `⚠ Kategori *${args[0]}* tidak ditemukan.\nKetik *${_p}menu* untuk melihat kategori.`, m)
        return
      }
    }

    // Main menu
    let mainMenu = `
${ucapan()} @${senderNum}

Aku ${global.namebot}, asisten WhatsApp yang siap membantumu mengakses berbagai fitur secara otomatis dan praktis.

${menuUser}

📢 Navigasi Menu
Tekan tombol di bawah untuk memilih kategori atau hubungi owner.
`.trim()

    const categoryKeys = Object.keys(categories).map(v => String(v).toLowerCase()).sort()
    const rows = []

    // Owner selalu di paling atas
    rows.push({
      title: '👑 Owner',
      description: 'Hubungi pemilik bot',
      id: `${_p}owner`
    })

    // Baru tambahkan kategori lainnya
    categoryKeys.forEach(key => {
      const cmds = help
        .filter(p => p.tags.map(t => String(t).toLowerCase()).includes(key))
        .flatMap(p => p.help)
        .filter(Boolean)
      rows.push({
        title: `Menu ${categories[key]}`,
        description: `Tersedia ${cmds.length} perintah`,
        id: `${_p}menu ${key}`
      })
    })

    const sections = [{ title: 'Atri-MD AI Assistant. By Dhieka', rows }]

    if (global.useVideoMenu) {
      await conn.sendMessage(m.chat, {
        video: { url: global.videonya },
        gifPlayback: true,
        caption: mainMenu,
        footer: global.footerText,
        mentions: [m.sender],
        buttons: [
          {
            buttonId: 'action',
            buttonText: { displayText: 'Pilih Kategori' },
            type: 4,
            nativeFlowInfo: {
              name: 'single_select',
              paramsJson: JSON.stringify({
                title: 'Atri-MD AI Assistant',
                sections
              })
            }
          }
        ]
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: global.fotonya },
        caption: mainMenu,
        footer: global.footerText,
        mentions: [m.sender],
        buttons: [
          {
            buttonId: 'action',
            buttonText: { displayText: 'Pilih Kategori' },
            type: 4,
            nativeFlowInfo: {
              name: 'single_select',
              paramsJson: JSON.stringify({
                title: 'Atri-MD AI Assistant',
                sections
              })
            }
          }
        ]
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠ Terjadi kesalahan saat menampilkan menu.', m)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|bot)$/i  // ⬅️ 'owner' dihapus, biar pakai plugin owner
handler.daftar = true
export default handler

// Helper functions
function getRemainingTime(ms) {
  if (ms <= 0) return '0 detik'
  let d = Math.floor(ms / 86400000)
  let h = Math.floor(ms / 3600000) % 24
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  const parts = []
  if (d) parts.push(`${d} hari`)
  if (h) parts.push(`${h} jam`)
  if (m) parts.push(`${m} menit`)
  if (s || parts.length === 0) parts.push(`${s} detik`)
  return parts.join(' ')
}

function waktuJakarta() {
  const now = new Date()
  const tanggal = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(now)
  const waktu = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now)
  return { tanggal, waktu }
}

function ucapan() {
  const hour = Number(new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', hour12: false }).format(new Date()))
  if (hour >= 4 && hour < 10) return 'Selamat pagi'
  if (hour >= 10 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}