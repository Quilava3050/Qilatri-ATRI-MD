import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'
import canvafy from 'canvafy'

let handler = async (m, { conn }) => {
  try {
    let user = global.db.data.users[m.sender]
    let who = m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.fromMe
        ? conn.user.jid
        : m.sender

    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')

    let {
      premium,
      premiumTime,
      level,
      limit,
      exp,
      daftar,
      koin,
      role,
      nama
    } = user

    let username = nama || await conn.getName(who)

    let isPremium = premium === true && Number(premiumTime || 0) > Date.now()
    let isOwner = Array.isArray(global.owner)
      ? global.owner.some(([id]) => m.sender.includes(id))
      : false

    let displayLimit = (isOwner || isPremium) ? '∞ [Limit Tanpa Batas]' : limit
    let expiredText = isPremium
      ? `*Expired Premium:* ${new Date(premiumTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
      : ''

    const image = await new canvafy.WelcomeLeave()
      .setAvatar(pp)
      .setBackground("image", "https://h.top4top.io/p_3572fjd6d1.jpg")
      .setTitle(username)
      .setDescription(`${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}`)
      .setBorder("#000000")
      .setAvatarBorder("#F0F8FF")
      .setOverlayOpacity(0.5)
      .build()

    let str = `
*Nama Pengguna:* ${username}
*Total Koin:* ${koin}
*Total Exp:* ${exp}
*Total Limit:* ${displayLimit}
${expiredText ? expiredText + '\n' : ''}*Role Saat Ini:* ${role}
*Level Saat Ini:* ${level}`.trim()

    await conn.sendFile(m.chat, image, '', str, m)
  } catch (e) {
    m.reply(`Nama kamu terlalu panjang, sehingga tidak dapat melihat profil kamu!`)
  }
}

handler.help = ['profile']
handler.tags = ['user']
handler.command = /^(profile|limit|me)$/i
handler.daftar = true

export default handler