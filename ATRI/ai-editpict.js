import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      m.reply('⏳ Sedang memproses gambar, harap tunggu...');

      const imgBuffer = await q.download();
      if (!imgBuffer) throw '❌ Tidak dapat mengunduh gambar.';

      const prompt = m.text.split(' ').slice(1).join(' ').trim();
      if (!prompt) return m.reply('❌ Mohon masukkan permintaan pengeditan, contoh: *ubah warna hijab menjadi biru*');

      const form = new FormData();
      form.append('image', imgBuffer, { filename: 'image.jpg', contentType: mime || 'image/jpeg' });
      form.append('param', prompt);

      const apiRes = await fetch('https://api.elrayyxml.web.id/api/ai/nanobanana', {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text().catch(() => '');
        throw `❌ Gagal memproses gambar. (${apiRes.status}) ${errText || ''}`.trim();
      }

      const ct = apiRes.headers.get('content-type') || '';
      if (ct.startsWith('image/')) {
        const outBuffer = await apiRes.buffer();
        await conn.sendFile(m.chat, outBuffer, 'edited.jpg', `✅ Gambar berhasil diedit: ${prompt}`, m);
      } else {
        const text = await apiRes.text();
        const url = (text.match(/https?:\/\/\S+/) || [])[0];
        if (url) {
          await conn.sendFile(m.chat, url, null, `✅ Gambar berhasil diedit: ${prompt}`, m);
        } else {
          await m.reply('✅ Permintaan diproses, namun respons bukan gambar maupun URL:\n```\n' + text.slice(0, 2000) + '\n```');
        }
      }
    } else {
      m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`);
    }
  } catch (e) {
    console.error(e);
    m.reply(`❌ Terjadi kesalahan saat memproses gambar. Silakan coba lagi.\n${e?.message || e}`);
  }
};

handler.help = ['editpict'];
handler.tags = ['ai'];
handler.command = ['editpict'];
handler.premium = true;
handler.limit = 3;

export default handler;