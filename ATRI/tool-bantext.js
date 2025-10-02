let bannedTexts = global.bannedTexts || []
global.bannedTexts = bannedTexts

let handler = async (m, { conn, command, text }) => {
  switch (command) {
    case 'bantext':
      if (!text) throw 'Masukkan teks yang mau di-ban!\n\nContoh: .bantext iklan'
      if (bannedTexts.includes(text)) throw 'Teks sudah ada di daftar ban.'
      bannedTexts.push(text)
      m.reply(`✅ Teks "${text}" berhasil ditambahkan ke daftar ban.`)
      break

    case 'unbantext':
      if (!text) throw 'Masukkan teks yang mau dihapus dari daftar ban!\n\nContoh: .unbantext iklan'
      if (!bannedTexts.includes(text)) throw 'Teks ini tidak ada di daftar ban.'
      bannedTexts.splice(bannedTexts.indexOf(text), 1)
      m.reply(`✅ Teks "${text}" berhasil dihapus dari daftar ban.`)
      break

    case 'textban':
      if (!bannedTexts.length) throw '❌ Tidak ada teks yang di-ban.'
      m.reply(`🚫 Daftar teks yang di-ban:\n\n${bannedTexts.map((v, i) => `${i + 1}. ${v}`).join('\n')}`)
      break
  }
}

handler.help = ['bantext <teks>', 'unbantext <teks>', 'textban']
handler.tags = ['group', 'tools']
handler.command = /^bantext|unbantext|textban$/i
handler.group = true
handler.admin = false

export default handler