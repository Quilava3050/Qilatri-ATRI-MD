let handler = async (m, { conn, args, usedPrefix, command }) => {
    const isOwner = global.owner.some(o => o[0] + '@s.whatsapp.net' === m.sender)
    if (!isOwner) throw `❌ Hanya *owner* yang bisa pakai command ini!`

    if (!args[0]) throw `Contoh: ${usedPrefix + command} !`

    let newPrefix = args[0].toLowerCase()
    let prefixText = ''

    if (newPrefix === 'multi') {
        global.prefix = /[!?.#]/i
        prefixText = 'multi prefix (! . ? #)'
    } else if (newPrefix === 'default') {
        global.prefix = '.'
        prefixText = 'default prefix (.)'
    } else {
        global.prefix = newPrefix
        prefixText = `prefix *${newPrefix}*`
    }

    // konfirmasi ke yang ubah
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    m.reply(`✅ Prefix berhasil diubah menjadi ${prefixText}`)

    // kirim pengumuman ke semua chat yang terdaftar
    let teks = `📢 *Pengumuman Prefix Baru*\n\n`
    teks += `Owner: @${m.sender.split('@')[0]}\n`
    teks += `Prefix sekarang: ${prefixText}\n\n`
    teks += `Silakan gunakan prefix baru untuk menjalankan perintah.`

    let chats = Object.keys(global.db.data.chats)
    for (let id of chats) {
        await conn.sendMessage(id, { 
            text: teks,
            mentions: [m.sender] 
        }).catch(_ => {}) // biar kalau ada error gak berhenti
    }
}

handler.help = ['setprefix [prefix|multi|default]']
handler.tags = ['owner']
handler.command = /^setprefix$/i
handler.owner = true

export default handler