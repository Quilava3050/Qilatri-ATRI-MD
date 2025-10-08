import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  await m.reply(global.wait)
  if (!isROwner) return

  let ar = Object.keys(ATRI)
  let ar1 = ar.map(v => v.replace('.js', ''))

  if (!text) throw `💡 *Gunakan format:*\n> ${usedPrefix + command} <nama_plugin>\n\nContoh:\n> ${usedPrefix + command} menu`

  // Jika plugin tidak ditemukan
  if (!ar1.includes(text)) {
    const notFoundMsg = `
╭━━━❖ *PLUGIN TIDAK DITEMUKAN* ❖
┃ 🔍  Nama Plugin: *${text}*
┃ 📦  Status: Tidak ditemukan di folder *ATRI/*
┃ 
┃ 📚  Daftar plugin yang tersedia:
┃ ${ar1.map(v => `│ • ${v}`).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Tips:*
- Pastikan nama plugin sesuai (huruf kecil semua)
- Contoh: \`${usedPrefix + command} menu\`
`.trim()

    return m.reply(notFoundMsg)
  }

  // Jika plugin ditemukan
  let o
  try {
    o = await exec('cat ATRI/' + text + '.js')
  } catch (e) {
    o = e
  } finally {
    let { stdout, stderr } = o
    if (stdout.trim()) m.reply(stdout)
    if (stderr.trim()) m.reply(stderr)
  }
}

handler.help = ['getplugin']
handler.tags = ['owner']
handler.command = /^(getplugin|gp)$/i
handler.rowner = true

export default handler
