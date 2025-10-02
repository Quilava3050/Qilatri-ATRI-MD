import { getInfo, spotifydl } from '../lib/spotify.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan Link Spotify ‼️\n*Contoh:* ${usedPrefix + command} https://open.spotify.com/track/xxxxxxxx`;

  conn.sendMessage(m.chat, {
    react: {
      text: '🕒',
      key: m.key,
    }
  });

  try {
    let music = await spotifydl(text);
    const info = await getInfo(text);

    if (!music.download) throw 'Gagal mendapatkan audio, coba link lain.';

    let caption = `🎵 *Spotify Downloader*\n\n`
      + `∘ *Title:* ${info.data.title}\n`
      + `∘ *Artist:* ${info.data.artist.name}\n`
      + `∘ *Duration:* ${info.data.duration}\n`
      + `∘ *Link:* ${text}`;

    await conn.sendMessage(m.chat, {
      image: { url: info.data.thumbnail }, 
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: music.download },
      mimetype: 'audio/mp4',
      fileName: `${info.data.title}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (e) {
    console.log(e);
    throw `Terjadi Kesalahan!\nCode: ${e}`;
  }
};

handler.help = ['spotifydl'];
handler.tags = ['downloader'];
handler.command = /^(spotifydl)$/i;
handler.register = false;
handler.limit = true;

handler.daftar = true

export default handler;