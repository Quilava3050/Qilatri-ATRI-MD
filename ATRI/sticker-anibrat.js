import fetch from 'node-fetch';
import { sticker } from '../lib/sticker.js'; // pastikan path ini sesuai struktur bot kamu

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `Contoh pemakaian:\n.${command} Halo, saya pengguna bot`;

  try {
    const url = `https://api.fasturl.link/maker/animbrat?text=${encodeURIComponent(text)}&position=center&mode=animated`;
    const res = await fetch(url, { headers: { accept: 'image/png' } });

    if (!res.ok) throw `Gagal mengambil gambar dari API`;

    const buffer = await res.buffer();

    let stiker = await sticker(buffer, false, global.stickpack, global.stickauth);

    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'anibrat.webp', '', m, { asSticker: true });
    } else {
      throw 'Gagal mengubah gambar menjadi stiker';
    }
  } catch (e) {
    console.error(e);
    throw 'Terjadi kesalahan saat membuat stiker.';
  }
};

handler.help = ['anibrat'];
handler.tags = ['sticker'];
handler.command = /^anibrat$/i;
handler.limit = true;
handler.premium = false;
handler.daftar = true;

export default handler;