import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, participants }) => {
    let rawUsers = m.quoted
        ? [m.quoted.sender]
        : m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))

    if (!rawUsers || rawUsers.length === 0) {
        return m.reply('Tidak ada user yang disebut atau dikutip untuk dikeluarkan.')
    }

    let kickedUser = []

    for (let raw of rawUsers) {
        const user = await getLidFromJid(raw, conn)
        let isParticipant = participants.find(v => areJidsSameUser(v.id, user))
        let isAdmin = isParticipant?.admin === 'admin' || isParticipant?.admin === 'superadmin'

        if (!isAdmin) {
            try {
                const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                kickedUser.push(...res.map(r => r.jid)) // simpan hanya jid
                await delay(1000)
            } catch (e) {
                console.error(`Gagal mengeluarkan ${user}:`, e)
            }
        }
    }

    if (kickedUser.length === 0) {
        return m.reply('Tidak ada yang berhasil dikeluarkan atau semua adalah admin.')
    }

    m.reply(
        `*Sukses Mengeluarkan:* ${kickedUser.map(jid => '@' + jid.split('@')[0]).join(', ')}`,
        null,
        { mentions: kickedUser }
    )
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = /^(kick)$/i

handler.admin = true
handler.group = true
handler.botAdmin = true
handler.daftar = true

export default handler

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Ambil dari handler.js
async function getLidFromJid(id, conn) {
    if (id.endsWith('@lid')) return id
    const res = await conn.onWhatsApp(id).catch(() => [])
    return res[0]?.lid || id
}