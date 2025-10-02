import translate from '@vitalets/google-translate-api'

let handler = async (m, { args, usedPrefix, command }) => {
  let lang, text

  // Cek apakah ada argumen bahasa + teks
  if (args.length >= 2) {
    lang = args[0] || 'id'
    text = args.slice(1).join(' ')
  } 
  // Jika ada pesan yang di-reply
  else if (m.quoted && m.quoted.text) {
    lang = args[0] || 'id'
    text = m.quoted.text
  } 
  // Jika input salah
  else {
    throw `⚠️ Contoh penggunaan:\n${usedPrefix + command} id hello i am robot`
  }

  // Proses terjemahan
  let res = await translate(text, { to: lang, autoCorrect: true }).catch(_ => null)

  // Jika bahasa tidak didukung
  if (!res) throw `❌ Error: Bahasa "${lang}" tidak support.`

  // Kirim hasil terjemahan
  m.reply(
    `🌐 *Hasil Terjemahan*\n\n` +
    `📌 *Terdeteksi dari:* ${res.from.language.iso}\n` +
    `➡️ *Diterjemahkan ke:* ${lang}\n\n` +
    `📝 *Hasil:* ${res.text}`.trim()
  )
}

// Informasi command
handler.help = ['translate']
handler.tags = ['tools']
handler.command = /^(tr(anslate)?)$/i
handler.limit = true
handler.daftar = true

export default handler
