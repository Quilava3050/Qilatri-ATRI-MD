import { chatUpAI } from '../lib/chatupai.js';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  const sub = args[0]?.toLowerCase();
  const content = args.slice(1).join(" ");

  if (!sub || !['chat', 'image', 'browse', 'pdf'].includes(sub)) {
    return m.reply(`⚠️ Gunakan format:

${usedPrefix + command} chat <pertanyaan>
${usedPrefix + command} image <prompt>
${usedPrefix + command} browse <topik>
${usedPrefix + command} pdf <reply PDF>`);
  }

  try {
    if (sub === 'chat') {
      if (!content) return m.reply('💬 Masukkan pertanyaan.');
      const res = await chatUpAI.chat(content);
      if (!res.success) throw res.result.error;
      await conn.reply(m.chat, res.result, m);

    } else if (sub === 'image') {
      if (!content) return m.reply('🖼 Masukkan prompt gambar.');
      const res = await chatUpAI.generateImage(content);
      if (!res.success) throw res.result.error;
      await conn.sendFile(m.chat, res.imageUrl, 'image.jpg', res.content, m);

    } else if (sub === 'browse') {
      if (!content) return m.reply('🌐 Masukkan topik pencarian.');
      const res = await chatUpAI.browsing(content);
      if (!res.success) throw res.result.error;
      let teks = `📑 *Deskripsi:* ${res.description}

🔗 *URL:*\n` + res.urls.join('\n');
      if (res.suggestions.length) teks += `\n\n💡 *Saran:*\n${res.suggestions.join('\n')}`;
      await conn.reply(m.chat, teks, m);

    } else if (sub === 'pdf') {
      if (!m.quoted || !/application\/pdf/.test(m.quoted?.mimetype || ''))
        return m.reply('📄 Balas ke file PDF yang ingin diubah menjadi teks.');
      const filePath = await m.quoted.download();
      const res = await chatUpAI.pdf2Text(filePath);
      if (!res.success) throw res.error;
      await conn.reply(m.chat, res.data, m);
    }
  } catch (e) {
    console.error(e);
    m.reply(`❌ Terjadi kesalahan:\n${e}`);
  }
};

handler.help = ['chatupai'].map(v => v + ' <chat|image|browse|pdf>');
handler.tags = ['ai'];
handler.command = /^chatupai$/i;

export default handler;