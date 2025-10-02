/*
Plugin ini dibuat oleh © ItsMeMatt ✘ ChatGPT
Menggunakan API dari:
https://api.nekorinn.my.id/maker/sologo-ai?title=<judul>&slogan=<slogan>&industry=<industri>

Fitur:
- Membuat logo AI dalam format carousel geser
- Logo dapat digeser tanpa spam chat

🤝 Mohon untuk tidak menghapus watermark ini.
Terima kasih atas apresiasinya!

📢 Channel WhatsApp: https://whatsapp.com/channel/0029Vb62vNgFsn0h0TEx6q1b
📩 Kontak WA: wa.me/6282191987064
*/

import fetch from 'node-fetch'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Example:\n.${command} ATRI-MD|Anti Karat|Alhamdulillah\n\nFormat:\nTitle|Slogan|Industry`

  let [title, slogan, industry] = text.split('|').map(v => v.trim())
  if (!title || !slogan || !industry) throw 'Format salah!\nGunakan: Title|Slogan|Industry'

  await m.reply('⏳ Membuat logo, tunggu sebentar...')

  try {
    let url = `https://api.nekorinn.my.id/maker/sologo-ai?title=${encodeURIComponent(title)}&slogan=${encodeURIComponent(slogan)}&industry=${encodeURIComponent(industry)}`
    let res = await fetch(url)
    if (!res.ok) throw 'Gagal mengambil data dari API.'

    let json = await res.json()
    if (!json.status) throw 'Gagal membuat logo.'

    async function createImage(url) {
      const { imageMessage } = await generateWAMessageContent({
        image: { url }
      }, {
        upload: conn.waUploadToServer
      })
      return imageMessage
    }

    let cards = []
    let i = 1
    for (const logo of json.result.logos) {
      for (const style of logo.style) {
        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: `Style: ${style.title}\nDesc: ${style.desc}`
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: `Logo ${i++} - ${global.wm}`
          }),
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: '',
            hasMediaAttachment: true,
            imageMessage: await createImage(style.thumb)
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: []
          })
        })
      }
    }

    const carousel = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `✨ Hasil Logo AI untuk:\n• Title: ${title}\n• Slogan: ${slogan}\n• Industry: ${industry}\nGeser untuk melihat semua style logo.`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '© Atri-MD'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, {})

    await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id })

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat membuat logo.')
  }
}

handler.help = ['buatlogo <title>|<slogan>|<industry>']
handler.tags = ['ai']
handler.command = /^buatlogo$/i
handler.limit = true
handler.daftar = true

export default handler