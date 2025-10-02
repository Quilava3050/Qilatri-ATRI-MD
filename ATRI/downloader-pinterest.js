import pkg from '@whiskeysockets/baileys';
const { generateWAMessageContent, generateWAMessageFromContent, proto } = pkg;
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*Contoh:* ${usedPrefix + command} Shiroko,10`);
  }

  await m.reply('🔍 Sabar yaaa, Atri sedang mencari gambar...');

  const [query, jumlah] = text.split(',');
  const total = Math.min(Number(jumlah) || 5, 15); // Maks 15 agar tidak overload

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const createImage = async (url) => {
    const { imageMessage } = await generateWAMessageContent(
      { image: { url } },
      { upload: conn.waUploadToServer }
    );
    return imageMessage;
  };

  try {
    const apiUrl = `https://api.botcahx.eu.org/api/search/pinterest?apikey=Quilava&text1=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      return m.reply(`🔎 Tidak ditemukan hasil untuk: *"${query}"*`);
    }

    const images = json.result;
    shuffleArray(images);
    const selectedImages = images.slice(0, total);

    let cards = [];
    let index = 1;

    for (const imageUrl of selectedImages) {
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `🖼 Gambar ke-${index++}`,
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: 'Atri-MD',
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '✨ Hasil Pencarian',
          hasMediaAttachment: true,
          imageMessage: await createImage(imageUrl),
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 Lihat di Pinterest',
                url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
                merchant_url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
              }),
            },
          ],
        }),
      });
    }

    const carouselMsg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `✅ Berikut hasil pencarian untuk *"${query}"*`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: '🔄 Geser untuk lihat semua gambar',
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false,
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards,
              }),
            }),
          },
        },
      },
      {}
    );

    await conn.relayMessage(m.chat, carouselMsg.message, { messageId: carouselMsg.key.id });
  } catch (error) {
    console.error('❌ Terjadi error:', error);
    m.reply('❌ Terjadi kesalahan saat mengambil gambar dari Pinterest.');
  }
};

handler.help = ['pinsearch <query>,<jumlah>'];
handler.tags = ['downloader'];
handler.command = /^(pin|pinsearch|pins)$/i;

export default handler;