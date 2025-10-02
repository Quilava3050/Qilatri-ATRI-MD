import fs from 'fs'
let handler = async (m, { conn, args, command }) => {
let fitur = Object.values(ATRI).filter(v => v.help && !v.disabled).map(v => v.help).flat(1)
let totalf = Object.values(global.ATRI).filter(
    (v) => v.help && v.tags
  ).length;
 await m.reply(`Fitur Yang Di Miliki ${global.namebot} Saat Ini\nTotal: ${fitur.length} Fitur`)
}
handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.daftar = true
export default handler