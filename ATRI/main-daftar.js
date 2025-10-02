import { createHash } from 'crypto'

const Reg = /^([^\d]+)$/i

let handler = async function (m, { text, usedPrefix }) {
  let user = global.db.data.users[m.sender]

  if (user.daftar === true) {
    throw `🚫 Kamu sudah terdaftar di database!\n\nJika ingin daftar ulang, ketik:\n*${usedPrefix}unreg <serial_number>*`
  }

  if (!Reg.test(text)) {
    throw `📌 Format salah!\nGunakan: *${usedPrefix}daftar Nama*\nContoh: *${usedPrefix}daftar Matt*`
  }

  let [_, nama] = text.match(Reg)

  if (!nama) throw '❗ Nama tidak boleh kosong.'

  user.nama = nama.trim()
  user.regTime = +new Date()
  user.daftar = true
  user.registered = true

  let sn = createHash('md5').update(m.sender).digest('hex')

  let caption = `🎉 *Pendaftaran Berhasil!*\n\n` +
                `📇 *Nama:* ${nama}\n` +
                `🆔 *Serial Number:*\n\`\`\`${sn}\`\`\`\n\n` +
                `📌 Simpan SN kamu untuk unregister jika diperlukan.`

  await conn.reply(m.chat, caption, m)
}

handler.help = ['daftar']
handler.tags = ['user']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler