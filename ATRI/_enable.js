let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()

  let isAll = false
  let isUser = false

  // --- Helper: Cek hak akses ---
  const needAdmin = () => {
    if (m.isGroup && !(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
  }
  const needOwner = () => {
    if (!isOwner) {
      global.dfail('owner', m, conn)
      throw false
    }
  }
  const needROwner = () => {
    if (!isROwner) {
      global.dfail('rowner', m, conn)
      throw false
    }
  }

  switch (type) {
    case 'welcome': needAdmin(); chat.welcome = isEnable; break
    case 'detect': needAdmin(); chat.detect = isEnable; break
    case 'delete': needAdmin(); chat.delete = isEnable; break
    case 'viewonce':
    case 'antiviewonce': needAdmin(); chat.viewonce = isEnable; break
    case 'desc': needAdmin(); chat.descUpdate = isEnable; break
    case 'antidelete': needAdmin(); chat.antiDelete = !isEnable; break
    case 'autodelvn': needAdmin(); chat.autodelvn = isEnable; break
    case 'document': chat.useDocument = isEnable; break

    // BOT-WIDE SETTINGS (Owner Only)
    case 'clear': isAll = true; needOwner(); bot.clear = isEnable; break
    case 'public': isAll = true; needROwner(); global.opts.self = !isEnable; break
    case 'restrict': isAll = true; needOwner(); bot.restrict = isEnable; break
    case 'autobackup': isAll = true; needOwner(); bot.backup = isEnable; break
    case 'autoread': isAll = true; needROwner(); global.opts.autoread = isEnable; break
    case 'nyimak': isAll = true; needROwner(); global.opts.nyimak = isEnable; break
    case 'pconly': isAll = true; needROwner(); global.opts.pconly = isEnable; break
    case 'gconly': isAll = true; needROwner(); global.opts.gconly = isEnable; break
    case 'swonly': isAll = true; needROwner(); global.opts.swonly = isEnable; break

    // ANTI & FILTER
    case 'antilink': needAdmin(); chat.antiLink = isEnable; break
    case 'antifoto': needAdmin(); chat.antiFoto = isEnable; break
    case 'antivideo': needAdmin(); chat.antiVideo = isEnable; break
    case 'antiaudio': needAdmin(); chat.antiAudio = isEnable; break
    case 'antisticker': needAdmin(); chat.antiSticker = isEnable; break
    case 'antispam': needAdmin(); chat.antiSpam = isEnable; break

    // AUTO SYSTEMS
    case 'autopresence': needROwner(); chat.autoPesence = isEnable; break
    case 'autoreply': needROwner(); chat.autoReply = isEnable; break
    case 'autosticker': needROwner(); chat.autoSticker = isEnable; break
    case 'autojoin': needROwner(); chat.autoJoin = isEnable; break
    case 'autoupnews': needROwner(); chat.updateAnimeNews = isEnable; break
    case 'autoupnime': needROwner(); chat.updateAnime = isEnable; break

    // GROUP FEATURES
    case 'chatbot': needAdmin(); chat.chatbot = isEnable; break
    case 'bcjoin': needAdmin(); chat.bcjoin = isEnable; break
    case 'game': needAdmin(); chat.gameMode = isEnable; break
    case 'getmsg': needAdmin(); chat.getmsg = isEnable; break

    // USER-LEVEL
    case 'autolevelup': isUser = true; user.autolevelup = isEnable; break

    // WHITELIST CONTACT
    case 'mycontact':
    case 'mycontacts':
    case 'whitelistcontact':
    case 'whitelistcontacts':
    case 'whitelistmycontact':
    case 'whitelistmycontacts':
      needOwner(); conn.callWhitelistMode = isEnable; break

    default:
      return m.reply(`
╭───〔 *List Opsi ON/OFF* 〕
│ 🟢 *Group Features*
│ welcome, delete, detect, chatbot, game
│ 
│ 🔒 *Anti & Filter*
│ antilink, antifoto, antivideo, antiaudio, antisticker, antispam, antidelete
│ 
│ ⚙️ *Auto System*
│ autolevelup, autosticker, autoreply, autopresence, autobackup
│ 
│ 🌐 *Bot Owner Only*
│ public, restrict, clear, autoread, nyimak, pconly, gconly, swonly
╰───────────────────────

Contoh Aktif:  *.on welcome*
Contoh Nonaktif:  *.off welcome*
`.trim())
  }

  conn.reply(
    m.chat,
    `✅ Sukses *${isEnable ? 'Mengaktifkan' : 'Menonaktifkan'}* fitur *${type.toUpperCase()}*
📍 Untuk: ${isAll ? 'Semua Bot' : isUser ? 'User Ini' : 'Group Ini'}`,
    m
  )
}

handler.help = ['on', 'off']
handler.tags = ['group', 'owner']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

export default handler