import fetch from 'node-fetch';

const handler = async (m, { text, args }) => {
  const prompt = args.join(' ');
  if (!prompt) return m.reply('❌ Masukkan pertanyaan, contoh: *.gemini bagaimana AI bekerja?*');

  const API_KEY = process.env.GEMINI_KEY || 'AIzaSyCD2f7jy9siBLZUvYXv0Z-dppyUKzn7GqU';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const res = await fetch(`${url}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`❌ Gagal ambil respon dari Gemini API:\n${error}`);
    }

    const json = await res.json();
    const result = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) throw new Error('❌ Tidak ada jawaban yang diterima dari Gemini.');

    await m.reply(`🤖 *GenAi says:*\n\n${result}`);
  } catch (err) {
    console.error(err);
    m.reply(`❌ Terjadi kesalahan:\n${err.message}`);
  }
};

handler.help = ['genai <pertanyaan>'];
handler.tags = ['ai'];
handler.command = /^genai$/i;
handler.limit = false;

export default handler;