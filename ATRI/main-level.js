import { canLevelUp, xpRange } from '../lib/levelling.js'
import canvafy from 'canvafy'

let handler = async (m, { conn }) => {
  if (global.db?.data == null) await global.loadDatabase()

  let user = global.db.data.users[m.sender]
  if (!user) {
    user = global.db.data.users[m.sender] = {
      exp: 0,
      level: 0,
      role: 'Warrior ⚔️',
      nama: await conn.getName(m.sender).catch(() => m.sender.split('@')[0]),
      limit: 100,
      premium: false,
      premiumTime: 0
    }
  }

  let name = user.nama
  let before = user.level

  // Cek bisa naik level
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    let teks = `✨ Level kamu: *${user.level}*\n📊 EXP: *${user.exp - min}/${xp}*\nKurang *${max - user.exp} XP* lagi buat naik level!`
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png')

    try {
      const rank = new canvafy.Rank()
      rank.setAvatar(pp)
      rank.setBackground("image", "https://g.top4top.io/p_3568hw9bf1.jpg")
      rank.setUsername(name)
      rank.setLevel(user.level)
      rank.setCurrentXp(user.exp - min)
      rank.setRequiredXp(xp)
      rank.setRankName(user.role)
      rank.setBarColor("#00C4FF")
      rank.setOverlayOpacity(0.45)
      rank.setBorder("#00C4FF")
      const image = await rank.build()

      return conn.sendMessage(m.chat, { image, caption: teks }, { quoted: m })
    } catch (e) {
      console.error("Rank build error:", e)
      return m.reply(teks)
    }
  }

  // Kalau bisa naik level
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

  // Tentukan rank baru
  const getRank = lvl => {
    if (lvl <= 10) return "Warrior ⚔️"
    if (lvl <= 30) return "Elite 🛡️"
    if (lvl <= 60) return "Master 💠"
    if (lvl <= 100) return "Grandmaster 🔮"
    if (lvl <= 150) return "Epic ⭐"
    if (lvl <= 200) return "Legend 🔥"
    if (lvl <= 250) return "Mythic ⚡"
    if (lvl <= 999) return "Mythical Glory 👑"
    return "Supreme Legend 🏆"
  }

  user.role = getRank(user.level)

  if (before !== user.level) {
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png')
    let teks = `🎉 *LEVEL UP!*\n\n👤 ${name}\n📈 Dari Level *${before}* → *${user.level}*\n🏅 Rank Baru: *${user.role}*\n\nSemakin aktif kamu, semakin tinggi rank-mu! 🔥`

    try {
      const lvl = new canvafy.LevelUp()
      lvl.setAvatar(pp)
      lvl.setBackground("image", "https://g.top4top.io/p_3568hw9bf1.jpg")
      lvl.setUsername(name)
      lvl.setAvatarBorder("#00C4FF")
      lvl.setOverlayOpacity(0.5)

      // 💡 Tambahkan level lama dan baru
      if (typeof lvl.setOldLevel === 'function') lvl.setOldLevel(before)
      else if (typeof lvl.setPreviousLevel === 'function') lvl.setPreviousLevel(before)

      if (typeof lvl.setNewLevel === 'function') lvl.setNewLevel(user.level)
      else if (typeof lvl.setNextLevel === 'function') lvl.setNextLevel(user.level)

      const image = await lvl.build()
      await conn.sendMessage(m.chat, { image, caption: teks }, { quoted: m })
    } catch (e) {
      console.error("LevelUp build error:", e)
      m.reply(teks)
    }
  }
}

handler.help = ['level']
handler.tags = ['user']
handler.command = /^(level|levelup)$/i
export default handler
