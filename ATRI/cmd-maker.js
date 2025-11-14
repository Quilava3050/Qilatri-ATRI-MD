import fs from 'fs'

// Lokasi database untuk menyimpan command
const CMD_PATH = './database/cmdstore.json'

function loadCmd() {
  if (!fs.existsSync(CMD_PATH)) return {}
  try {
    return JSON.parse(fs.readFileSync(CMD_PATH))
  } catch {
    return {}
  }
}

function saveCmd(data) {
  fs.writeFileSync(CMD_PATH, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text, command }) => {
  // ambil semua nomor owner dari global.owner
  const owners = global.owner.map(([num]) => num + '@s.whatsapp.net')

  // cek apakah pengirim adalah owner
  if (!owners.includes(m.sender))
    return m.reply('❌ Fitur ini hanya untuk *Owner Bot*!')

  const cmdDB = loadCmd()

  if (command === 'buatcmd') {
    if (!text.includes('|'))
      return m.reply('Format salah!\nContoh: .buatcmd halo|hai juga!')
    const [name, response] = text.split('|').map(v => v.trim())

    if (!name || !response)
      return m.reply('Format: .buatcmd <nama>|<balasan>')

    cmdDB[name.toLowerCase()] = response
    saveCmd(cmdDB)
    return m.reply(`✅ Command *${name}* berhasil dibuat!`)
  }

  if (command === 'hapuscmd') {
    const name = text.trim().toLowerCase()
    if (!cmdDB[name]) return m.reply('❌ Command tidak ditemukan.')
    delete cmdDB[name]
    saveCmd(cmdDB)
    return m.reply(`🗑️ Command *${name}* berhasil dihapus.`)
  }

  if (command === 'listcmd') {
    const list = Object.keys(cmdDB)
    if (!list.length) return m.reply('📭 Belum ada command custom.')
    return m.reply('📜 *Daftar Custom Command:*\n' + list.map(v => `- ${v}`).join('\n'))
  }
}

handler.before = async (m) => {
  const cmdDB = loadCmd()
  const text = m.text?.trim()?.toLowerCase()
  if (cmdDB[text]) {
    await m.reply(cmdDB[text])
    return true
  }
  return false
}

handler.help = ['buatcmd', 'hapuscmd', 'listcmd']
handler.tags = ['owner']
handler.command = /^(buatcmd|hapuscmd|listcmd)$/i

export default handler