import { Akinator } from '@aqul/akinator-api'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const input = args[0]?.toLowerCase()
  const user = global.db.data.users[m.sender]
  conn.akinator = conn.akinator || {}

  // Tampilkan menu bantuan jika input kosong
  if (!input) {
    return m.reply(`🎮 *Akinator - Tebak Tokoh!*\n\n📌 *Perintah:*\n• *${usedPrefix + command} mulai* - Memulai permainan\n• *${usedPrefix + command} <angka>* - Menjawab pertanyaan\n• *${usedPrefix + command} keluar* - Mengakhiri permainan\n\n💬 *Pilihan Jawaban:*\n0: Ya\n1: Tidak\n2: Tidak Tahu\n3: Mungkin\n4: Mungkin Tidak\n\nContoh: *${usedPrefix + command} 0*`)
  }

  // Keluar dari sesi
  if (['keluar', 'end', 'stop'].includes(input)) {
    if (!(m.sender in conn.akinator)) return m.reply('🚫 Kamu tidak sedang bermain Akinator.')
    delete conn.akinator[m.sender]
    user.akinator.sesi = false
    return m.reply('✅ Kamu telah keluar dari sesi Akinator.')
  }

  // Memulai permainan
  if (['mulai', 'start'].includes(input)) {
    if (m.sender in conn.akinator) return m.reply('⚠️ Kamu masih dalam sesi Akinator. Jawab dulu pertanyaannya.')
    const aki = new Akinator({ region: 'id', childMode: false })
    await aki.start()

    conn.akinator[m.sender] = aki
    user.akinator.sesi = true

    return m.reply(`🎮 *Akinator - Tebak Tokoh!*\n\n🧠 Pertanyaan: ${aki.question}\n📊 Progress: ${aki.progress.toFixed(2)}%\n\n💬 *Jawaban:*\n0: Ya\n1: Tidak\n2: Tidak Tahu\n3: Mungkin\n4: Mungkin Tidak\n\nContoh: *${usedPrefix + command} 0*\nKetik *${usedPrefix + command} keluar* untuk mengakhiri.`)
  }

  // Pastikan sesi sudah dimulai sebelum memproses apapun
  if (!(m.sender in conn.akinator)) {
    return m.reply(`⚠️ Kamu belum memulai sesi Akinator. Ketik *${usedPrefix + command} mulai*`)
  }

  // Proses jawaban 0–4
  const jawab = parseInt(input)
  if (!isNaN(jawab) && [0, 1, 2, 3, 4].includes(jawab)) {
    const aki = conn.akinator[m.sender]
    try {
      await aki.answer(jawab)

      if (aki.isWin) {
        const teks = `🎉 *Akinator Menebak!*\n\n📛 *${aki.sugestion_name}*\n📝 ${aki.sugestion_desc}`
        await conn.sendFile(m.chat, aki.sugestion_photo, 'akinator.jpg', teks, m)
        delete conn.akinator[m.sender]
        user.akinator.sesi = false
      } else {
        return m.reply(`🎮 *Akinator - Tebak Tokoh!*\n\n🧠 Pertanyaan: ${aki.question}\n📊 Progress: ${aki.progress.toFixed(2)}%\n\n💬 *Jawaban:*\n0: Ya\n1: Tidak\n2: Tidak Tahu\n3: Mungkin\n4: Mungkin Tidak\n\nContoh: *${usedPrefix + command} 0*\nKetik *${usedPrefix + command} keluar* untuk mengakhiri.`)
      }
    } catch (e) {
      console.error(e)
      delete conn.akinator[m.sender]
      user.akinator.sesi = false
      return m.reply('⚠️ Terjadi kesalahan. Permainan diakhiri.')
    }
  } else {
    // Jika input bukan angka 0–4 → dianggap salah
    return m.reply(`❌ *Input tidak valid!*\nGunakan perintah:\n\n• *${usedPrefix + command} <angka 0-4>* - Menjawab pertanyaan\n• *${usedPrefix + command} keluar* - Mengakhiri permainan\n\n💬 *Pilihan Jawaban:*\n0: Ya\n1: Tidak\n2: Tidak Tahu\n3: Mungkin\n4: Mungkin Tidak`)
  }
}

handler.help = ['akinator']
handler.tags = ['game']
handler.command = /^akinator$/i
handler.limit = false
handler.group = true
handler.daftar = true

export default handler