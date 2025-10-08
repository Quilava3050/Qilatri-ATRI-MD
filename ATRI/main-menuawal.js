import fs from 'fs'

// Konfigurasi media menu & footer global
global.fotonya = 'https://files.catbox.moe/nxvt5v.jpg'
global.videonya = 'https://files.catbox.moe/5b6fsx.mp4'
global.useVideoMenu = true // true = video, false = foto
global.footerText = `⚡ ${global.namebot} • Powered by ${global.ownerName || 'Natsuki Minamo'} ⚡`

let handler = async (m, { conn, usedPrefix: _p, args }) => {
  try {
       await conn.sendMessage(m.chat, { react: { text: '🍃', key: m.key } })
    // Data user
    const user = global.db?.data?.users?.[m.sender] || {}
    const nama = user.nama || m.pushName || 'PENGGUNA'
    const exp = user.exp || 0
    const koin = user.koin || 0
    const limit = user.limit || 0

    if (user.premium && Number(user.premiumTime || 0) <= Date.now()) {
      user.premium = false
      user.premiumTime = 0
    }

    const senderNum = m.sender.split('@')[0]
    const isOwner = Array.isArray(global.owner)
      ? global.owner.some(([id]) => String(id) === senderNum)
      : false
    const isPremium = user.premium && Number(user.premiumTime) > Date.now()
    const status = isOwner ? '👑 Owner' : isPremium ? '💎 Premium' : '🧍 Free User'
    const sisaPremium = isOwner ? '♾️ Permanent' : (isPremium ? getRemainingTime(user.premiumTime - Date.now()) : '-')

    const { tanggal, waktu } = waktuJakarta()

    // ────🧭 Info User ─────────────────────────────
    const menuUser = `
╭─═⪩ *PENGGUNA* ⪨═─╮
│ 🌸 Nama     : ${nama}
│ 🧩 Status   : ${status}
│ ⚡ Exp      : ${exp}
│ 💰 Koin     : ${koin}
│ 🎟️ Limit    : ${limit}
│ 💎 Premium  : ${sisaPremium}
│ 🗓️ Tanggal  : ${tanggal}
│ 🕐 Waktu    : ${waktu} WIB
╰────────────────────╯
`.trim()

    // Ambil semua plugin
    const help = Object.values(global.ATRI)
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

    const categories = {}
    help.forEach(p => {
      p.tags.forEach(tag => {
        if (tag && !(tag in categories)) categories[tag] = tag
      })
    })

    // ────📂 Jika user pilih kategori ─────────────────────────────
    if (args[0]) {
      const category = args[0].toLowerCase()
      if (category in categories) {
        const commands = help
          .filter(menu => menu.tags.map(t => String(t).toLowerCase()).includes(category))
          .map(menu => menu.help.map(cmd => {
            let marks = ''
            if (menu.limit) marks += 'Ⓛ '
            if (menu.premium) marks += 'Ⓟ '
            if (menu.owner || menu.rowner) marks += 'Ⓞ '
            return `│ ➤ ${menu.prefix ? cmd : `${_p}${cmd}`} ${marks}`.trim()
          }).join('\n')).join('\n')

        const menuContent = `
╭─═⪩ *MENU ${category.toUpperCase()}* ⪨═─╮
${commands || '│ (Belum ada perintah.)'}
╰────────────────────╯
`.trim()

        const caption = `${ucapan()} @${senderNum} 🌅

Berikut daftar perintah di kategori *${category}*:

${menuContent}
${global.footerText}`

        if (global.useVideoMenu) {
          conn.sendMessage(m.chat, {
            video: { url: global.videonya },
            gifPlayback: true,
            caption,
            mentions: [m.sender]
          }, { quoted: m })
        } else {
          conn.sendMessage(m.chat, {
            image: { url: global.fotonya },
            caption,
            mentions: [m.sender]
          }, { quoted: m })
        }
        return
      } else {
        return conn.reply(m.chat, `⚠️ Kategori *${args[0]}* tidak ditemukan.\nKetik *${_p}menu* untuk melihat semua kategori.`, m)
      }
    }

    // ────📋 Main Menu ─────────────────────────────
    const mainMenu = `
╭───『 *${global.namebot}* 』───╮
│ Halo ${nama}!
│ ${ucapan()} 
│ semoga harimu menyenangkan 🌸
│ Aku adalah *asisten AI WhatsApp*, siap
│ membantumu menjalankan✨
╰────────────────────╯

${menuUser}

📚 *Navigasi Menu*
Pilih kategori di bawah ini untuk melihat fitur:
`.trim()

    // ────📑 List Kategori ─────────────────────────────
    const rows = [
      { title: '👑 Owner', description: 'Hubungi pemilik bot', id: `${_p}owner` },
      ...Object.keys(categories).sort().map(key => ({
        title: `📂 ${categories[key].toUpperCase()}`,
        description: `Lihat perintah di kategori ${key}`,
        id: `${_p}menu ${key}`
      }))
    ]

    const sections = [{ title: '📖 Daftar Kategori', rows }]

    const menuMedia = global.useVideoMenu
      ? { video: { url: global.videonya }, gifPlayback: true }
      : { image: { url: global.fotonya } }

    conn.sendMessage(m.chat, {
      ...menuMedia,
      caption: mainMenu,
      footer: global.footerText,
      mentions: [m.sender],
      buttons: [
        {
          buttonId: 'action',
          buttonText: { displayText: '📁 PILIH KATEGORI' },
          type: 4,
          nativeFlowInfo: {
            name: 'single_select',
            paramsJson: JSON.stringify({
              title: `${global.namebot}`,
              sections
            })
          }
        }
      ]
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Terjadi kesalahan saat menampilkan menu.', m)
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|bot)$/i
export default handler

// ────🕐 Helper Functions ─────────────────────────────
function getRemainingTime(ms) {
  if (ms <= 0) return '0 detik'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [d && `${d}h`, h && `${h}j`, m && `${m}m`, s && `${s}d`].filter(Boolean).join(' ')
}

function waktuJakarta() {
  const now = new Date()
  const tanggal = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
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