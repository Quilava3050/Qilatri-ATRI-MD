import { canLevelUp, xpRange } from '../lib/levelling.js'
import canvafy from 'canvafy'

let handler = async (m, { conn, usedPrefix, command, args, participants, groupMetadata, isAdmin, isBotAdmin } = {}) => {
    // Ensure database is loaded
    if (global.db?.data == null) await global.loadDatabase()

    // Ensure user record exists and has the minimal fields used here
    let user = global.db.data.users?.[m.sender]
    if (!user) {
        global.db.data.users = global.db.data.users || {}
        global.db.data.users[m.sender] = {
            exp: 0,
            level: 0,
            role: 'Warrior ⚔️',
            nama: await conn.getName(m.sender).catch(() => m.sender.split('@')[0]) || m.sender.split('@')[0],
            limit: 100,
            premium: false,
            premiumTime: 0
        }
        user = global.db.data.users[m.sender]
    }

    let name = user.nama || await conn.getName(m.sender).catch(() => m.sender.split('@')[0])

    // Cek apakah bisa level up
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
        let txt = `✨ Level kamu: *${user.level}*\n📊 EXP: *${user.exp - min}/${xp}*\nKurang *${max - user.exp} XP* lagi untuk naik level!`
        let who = m.sender
        let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')

        // Defensive canvafy usage: some canvafy versions have different method names
        let image
        try {
            const rank = new canvafy.Rank()
            const callIf = (obj, name, ...a) => { try { if (typeof obj[name] === 'function') obj[name](...a) } catch (e) { } }
            callIf(rank, 'setAvatar', pp)
            callIf(rank, 'setBackground', 'image', 'https://g.top4top.io/p_3568hw9bf1.jpg')
            // username/title compatibility
            if (typeof rank.setUsername === 'function') rank.setUsername(name)
            else if (typeof rank.setTitle === 'function') rank.setTitle(name)
            else if (typeof rank.setName === 'function') rank.setName(name)
            callIf(rank, 'setCurrentXp', user.exp - min)
            callIf(rank, 'setRequiredXp', xp)
            callIf(rank, 'setLevel', user.level)
            // rank name compatibility
            if (typeof rank.setRankName === 'function') rank.setRankName(user.role || 'Warrior ⚔️')
            else if (typeof rank.setRankTitle === 'function') rank.setRankTitle(user.role || 'Warrior ⚔️')
            else if (typeof rank.setRank === 'function') rank.setRank(user.role || 'Warrior ⚔️')
            callIf(rank, 'setBarColor', '#00C4FF')
            callIf(rank, 'setOverlayOpacity', 0.45)
            callIf(rank, 'setBorder', '#00C4FF')
            if (typeof rank.build === 'function') image = await rank.build()
        } catch (e) {
            console.error('canvafy Rank build error:', e)
        }

        if (!image) {
            // try fallback using WelcomeLeave which is more stable across canvafy versions
            try {
                const alt = new canvafy.WelcomeLeave()
                if (typeof alt.setAvatar === 'function') alt.setAvatar(pp)
                if (typeof alt.setBackground === 'function') alt.setBackground('image', 'https://l.top4top.io/p_35472wlaw1.jpg')
                if (typeof alt.setTitle === 'function') alt.setTitle(name)
                if (typeof alt.setDescription === 'function') alt.setDescription(`Level ${user.level} (${user.exp - min}/${xp})\nKurang ${max - user.exp} XP lagi untuk naik level!`)
                if (typeof alt.setBorder === 'function') alt.setBorder('#00C4FF')
                if (typeof alt.setAvatarBorder === 'function') alt.setAvatarBorder('#00C4FF')
                if (typeof alt.setOverlayOpacity === 'function') alt.setOverlayOpacity(0.45)
                if (typeof alt.build === 'function') image = await alt.build()
            } catch (e) {
                console.error('canvafy fallback Rank->WelcomeLeave error:', e)
            }
        }

        if (!image) return conn.sendMessage(m.chat, { text: txt }, { quoted: m })

        return conn.sendMessage(m.chat, { image, caption: txt }, { quoted: m })
    }

    // Kalau bisa naik level
    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

    // Role rank Mobile Legends style
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
        let who = m.sender
        let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')

        // Gambar untuk level up
        let image
        try {
            const lvl = new canvafy.LevelUp()
            const callIf = (obj, name, ...a) => { try { if (typeof obj[name] === 'function') obj[name](...a) } catch (e) { } }
            callIf(lvl, 'setAvatar', pp)
            callIf(lvl, 'setBackground', 'image', 'https://g.top4top.io/p_3568hw9bf1.jpg')
            if (typeof lvl.setUsername === 'function') lvl.setUsername(name)
            else if (typeof lvl.setTitle === 'function') lvl.setTitle(name)
            else if (typeof lvl.setName === 'function') lvl.setName(name)
            callIf(lvl, 'setAvatarBorder', '#00C4FF')
            callIf(lvl, 'setOverlayOpacity', 0.5)
            if (typeof lvl.build === 'function') image = await lvl.build()
        } catch (e) {
            console.error('canvafy LevelUp build error:', e)
        }

        // ✨ Tambahan teks agar terlihat keren dan jelas
        let txt = `🎉 *LEVEL UP!*\n\n👤 Nama: *${name}*\n📈 Dari Level: *${before}* → *${user.level}*\n🏅 Rank Baru: *${user.role}*\n⏰ ${new Date().toLocaleString('id-ID')}\n\n> Semakin aktif kamu, semakin tinggi rank-mu! 🔥`

        if (!image) {
            try {
                const alt = new canvafy.WelcomeLeave()
                if (typeof alt.setAvatar === 'function') alt.setAvatar(pp)
                if (typeof alt.setBackground === 'function') alt.setBackground('image', 'https://l.top4top.io/p_35472wlaw1.jpg')
                if (typeof alt.setTitle === 'function') alt.setTitle('LEVEL UP!')
                if (typeof alt.setDescription === 'function') alt.setDescription(`🎉 ${name}\nDari Level ${before} → ${user.level}`)
                if (typeof alt.setBorder === 'function') alt.setBorder('#00C4FF')
                if (typeof alt.setAvatarBorder === 'function') alt.setAvatarBorder('#00C4FF')
                if (typeof alt.setOverlayOpacity === 'function') alt.setOverlayOpacity(0.5)
                if (typeof alt.build === 'function') image = await alt.build()
            } catch (e) {
                console.error('canvafy fallback LevelUp->WelcomeLeave error:', e)
            }
        }

        if (!image) return conn.sendMessage(m.chat, { text: txt }, { quoted: m })

        await conn.sendMessage(m.chat, { image, caption: txt }, { quoted: m })
    }
}

handler.help = ['level']
handler.tags = ['user']
handler.command = /^(level|levelup)$/i
export default handler
