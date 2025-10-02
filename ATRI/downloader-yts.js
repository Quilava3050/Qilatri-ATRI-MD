import yts from 'yt-search';

let handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return await conn.reply(m.chat, `📍 Contoh penggunaan:\n.yts angel baby angels`, m);
    }

    await conn.reply(m.chat, global.wait, m);

    let results = await yts(text);
    let videos = results.all.filter(v => v.type === 'video').slice(0, 10);

    if (videos.length === 0) {
      return await conn.reply(m.chat, '❌ Tidak ada hasil ditemukan. Coba kata kunci lain!', m);
    }

    let teks = videos.map((v, i) => `
*${i + 1}. ${v.title}*
- Link: ${v.url}
- Durasi: ${v.timestamp}
- Upload: ${v.ago}
- Ditonton: ${v.views}x
`).join('\n\n');

    let thumbnail = videos[0].thumbnail || '';
    await conn.sendFile(m.chat, thumbnail, 'yts.jpeg', teks, m);

  } catch (err) {
    await conn.reply(m.chat, `⚠️ Terjadi kesalahan: ${err}`, m);
  }
};

handler.help = ['yts <judul>'];
handler.tags = ['downloader'];
handler.command = /^yts(earch)?$/i;
handler.limit = true;
handler.daftar = true;

export default handler;