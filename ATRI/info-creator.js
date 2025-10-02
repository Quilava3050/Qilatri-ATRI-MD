import { generateWAMessageFromContent, proto, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    // ambil nomor owner
    let ownerNumber = global.nomorowner || global.owner?.[0]?.[0] || '628xxx'
    let ownerWaUrl = `https://wa.me/${ownerNumber.replace(/[^0-9]/g, '')}`

    // teks info owner
    let ownerInfo = `👑 *OWNER BOT* 👑

Nama   : ${global.ownerName || 'Owner'}
Nomor  : +${ownerNumber}
Bot    : ${global.namebot || 'WhatsApp Bot'}

 Klik tombol di bawah untuk chat langsung dengan Owner.`

    // siapkan media (thumbnail bot/owner)
    const ownerMedia = await prepareWAMessageMedia(
      { image: { url: global.fotonya || 'https://telegra.ph/file/23dcf89c1a06c2b9e42a0.jpg' } },
      { upload: conn.waUploadToServer }
    )

    // bikin pesan interactive
    const ownerMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: ownerInfo
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: `© ${global.namebot || 'MyBot'} - Owner Info`
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              title: '',
              subtitle: '',
              hasMediaAttachment: true,
              ...ownerMedia
            }),
            contextInfo: {
              mentionedJid: [m.sender]
            },
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "💬 Chat Owner",
                    url: ownerWaUrl,
                    merchant_url: ownerWaUrl
                  })
                }
              ]
            })
          })
        }
      }
    }, { quoted: m })

    // kirim pesan
    await conn.relayMessage(m.chat, ownerMessage.message, { messageId: ownerMessage.key.id })

  } catch (e) {
    console.error(e)
    m.reply("⚠️ Gagal menampilkan info owner.")
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|infoowner)$/i

export default handler
