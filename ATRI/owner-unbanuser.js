import { jidNormalizedUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  const users = global.db?.data?.users || {}
  let candidate =
    (m.isGroup && m.mentionedJid && m.mentionedJid[0]) ||
    (m.quoted && m.quoted.sender) ||
    (text
      ? (text.includes('@') || text.startsWith('lid:')
          ? text.trim()
          : `${text.replace(/[^0-9]/g, '')}@s.whatsapp.net`)
      : null)

  if (!candidate) throw 'Siapa yang mau di-unban? Tag, reply pesannya, atau masukkan nomornya.'

  // Normalisasi LID -> JID (@s.whatsapp.net) bila perlu
  const normalized = jidNormalizedUser(candidate)
  const numberPart = normalized.split('@')[0]

  // Cari key user di DB:
  // 1) exact match
  // 2) atau cocokkan berdasarkan nomor (agar tetap ketemu walau suffix berbeda)
  const targetKey =
    users[normalized]
      ? normalized
      : Object.keys(users).find(j => (j.split('@')[0] === numberPart))

  if (!targetKey) throw 'Nomor tersebut belum terdaftar di database!'

  users[targetKey].banned = false
  users[targetKey].warning = 0
  delete users[targetKey].unbanTime

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
  await conn.reply(m.chat, `Berhasil unban @${numberPart}`, m, { mentions: [normalized] })
}

handler.help = ['unban @user | nomor']
handler.tags = ['owner']
handler.command = /^unban(user)?$/i
handler.rowner = true
handler.daftar = true

export default handler