let handler = async (m, { conn, isOwner }) => {
    let chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned)
    let users = Object.entries(global.db.data.users).filter(user => user[1].banned)

    let caption = `
┌〔 Daftar Chat Terbanned 〕
├ Total : ${chats.length} Chat${chats.length ? '\n' + chats.map(([jid], i) => `
├ ${i + 1}. ${conn.getName(jid) || 'Unknown'}
├ ${isOwner ? '@' + jid.split`@`[0] : jid}
`.trim()).join('\n') : ''}
└────

┌〔 Daftar Pengguna Terbanned 〕
├ Total : ${users.length} Pengguna${users.length ? '\n' + users.map(([jid, data], i) => {
        let banInfo
        if (data.unbanTime) {
            let now = Date.now()
            let remaining = data.unbanTime - now
            let unbanTimeStr = new Date(data.unbanTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
            let remainingStr = remaining > 0 ? formatDuration(remaining) : 'Kadaluarsa, bisa pakai lagi'
            banInfo = `⏰ Sampai: ${unbanTimeStr}\n   ⌛ Sisa: ${remainingStr}`
        } else {
            banInfo = '⏰ Permanent'
        }
        return `
├ ${i + 1}. ${conn.getName(jid) || 'Unknown'}
├ ${isOwner ? '@' + jid.split`@`[0] : jid}
├ ${banInfo}
`.trim()
    }).join('\n') : ''}
└────
`.trim()

    conn.reply(m.chat, caption, m, { contextInfo: { mentionedJid: conn.parseMention(caption) } })
}

handler.help = ['bannedlist']
handler.tags = ['info']
handler.command = /^listban(ned)?|ban(ned)?list|daftarban(ned)?$/i
handler.owner = false
handler.daftar = true
export default handler

// Helper buat format durasi
function formatDuration(ms) {
    let s = Math.floor(ms / 1000)
    let m = Math.floor(s / 60)
    let h = Math.floor(m / 60)
    let d = Math.floor(h / 24)
    s %= 60
    m %= 60
    h %= 24
    let parts = []
    if (d) parts.push(`${d} hari`)
    if (h) parts.push(`${h} jam`)
    if (m) parts.push(`${m} menit`)
    if (s) parts.push(`${s} detik`)
    return parts.join(', ')
}