import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) return conn.reply(m.chat, '*[🔎] send url*', m)

  try {
    // kasih react "⏳" saat proses dimulai
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()

    // kirim hasil screenshot
    await conn.sendFile(m.chat, ss, 'ss.png', `✅ Screenshot from: ${args[0]}`, m)

    // kasih react "✅" kalau berhasil
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    // kasih react "❌" kalau error
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, `⚠️ Error: ${e.message}`, m)
  }
}

handler.help = ['ss', 'ssweb']
handler.tags = ['internet']
handler.command = /^ss(web)?f?$/i
handler.daftar = true
handler.limit = true

export default handler
