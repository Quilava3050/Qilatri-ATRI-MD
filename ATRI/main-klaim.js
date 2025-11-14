import { canLevelUp } from '../lib/levelling.js'

let handler = async (m, { conn, isPrems }) => {
    let user = global.db.data.users[m.sender]
    let time = user.udahklaim + 86400000
    
    if (new Date - user.udahklaim < 86400000) {
        return m.reply(`⏰ *KLAIM HARIAN*\n\n❌ Kamu sudah klaim hari ini!\n\n⏳ *Tunggu:* ${msToTime(time - new Date())} lagi`)
    }

    // Random rewards dengan range yang lebih banyak
    let randomRewards = {
        exp: Math.floor(Math.random() * (500 - 100 + 1)) + 100,        // 100-500 EXP
        limit: Math.floor(Math.random() * (25 - 10 + 1)) + 10,         // 10-25 Limit
        koin: Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000,   // 1000-3000 Koin
        money: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,  // 1000-5000 Money
    }
    
    // Bonus untuk premium users
    if (isPrems) {
        randomRewards.exp = Math.floor(randomRewards.exp * 1.5)
        randomRewards.limit = Math.floor(randomRewards.limit * 1.5)
        randomRewards.koin = Math.floor(randomRewards.koin * 1.5)
        randomRewards.money = Math.floor(randomRewards.money * 1.5)
    }
    
    // Rare bonus (10% chance)
    let rareBonus = ''
    if (Math.random() < 0.1) {
        let bonusType = Math.floor(Math.random() * 3)
        if (bonusType === 0) {
            randomRewards.limit += 10
            rareBonus = '\n🎁 *RARE BONUS:* +10 Limit!'
        } else if (bonusType === 1) {
            randomRewards.koin += 2000
            rareBonus = '\n🎁 *RARE BONUS:* +2000 Koin!'
        } else {
            randomRewards.exp += 300
            rareBonus = '\n🎁 *RARE BONUS:* +300 EXP!'
        }
    }
    
    // Save old level untuk check levelup
    let oldLevel = user.level
    
    // Apply rewards
    user.exp += randomRewards.exp
    user.limit += randomRewards.limit
    user.koin += randomRewards.koin
    user.money += randomRewards.money
    user.udahklaim = new Date * 1
    
    // Check auto levelup
    let levelUpMessage = ''
    if (user.autolevelup && canLevelUp(user.level, user.exp, global.multiplier)) {
        while (canLevelUp(user.level, user.exp, global.multiplier)) {
            user.level++
        }
        let levelGain = user.level - oldLevel
        if (levelGain > 0) {
            levelUpMessage = `\n\n🎉 *LEVEL UP!*\n📊 Level ${oldLevel} → ${user.level} (+${levelGain})`
        }
    }
    
    let rewardText = `🎁 *KLAIM HARIAN BERHASIL!*\n\n` +
                     `🎉 Kamu mendapat hadiah random:\n\n` +
                     `✨ *+${randomRewards.exp}* EXP\n` +
                     `🎫 *+${randomRewards.limit}* Limit\n` +
                     `🪙 *+${randomRewards.koin}* Koin\n` +
                     `💰 *+${randomRewards.money}* Money` +
                     (isPrems ? '\n\n⭐ *Premium Bonus:* +50% semua reward!' : '') +
                     rareBonus +
                     levelUpMessage +
                     `\n\n⏰ Klaim lagi besok untuk hadiah baru!`
    
    await conn.reply(m.chat, rewardText, m)
}
handler.help = ['klaim']
handler.tags = ['user']
handler.command = /^(klaim)$/i

handler.fail = null
handler.daftar = true

export default handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    monthly = Math.floor((duration / (1000 * 60 * 60 * 24)) % 720)

  monthly  = (monthly < 10) ? "0" + monthly : monthly
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return monthly + " Hari " +  hours + " Jam " + minutes + " Menit"
}