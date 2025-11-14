import axios from 'axios';

let handler = async (m, { conn }) => {};

handler.tags = ['ai'];

handler.before = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;
    conn.selfai = conn.selfai || {};
    if (m.isBaileys && m.fromMe) return;

    const botNumber = conn.user?.id?.split('@')[0] || conn.user?.jid?.split('@')[0];
    const isMention = (m.mentionedJid || []).some(jid => jid.includes(botNumber))
      || (m.text && m.text.includes(botNumber)); // tambahan fix

    if (!isMention) return;

    const filter = m.text.replace(/@\d+/g, '').trim();

    // RESET SESSION
    if (filter.toLowerCase() === '/reset') {
      delete conn.selfai[m.sender];
      await m.reply('✅ Session chat berhasil direset.');
      return true;
    }

    // IMAGINE FEATURE
    if (filter.toLowerCase().startsWith('/imagine')) {
      const imagePrompt = filter.replace('/imagine', '').trim();
      if (!imagePrompt) return m.reply('💡 Tulis deskripsi gambarnya ya!');
      try {
        await conn.sendPresenceUpdate('composing', m.chat);
        const res = await axios.get(
          `https://api.botcahx.eu.org/api/search/openai-image?apikey=${global.btc}&text=${encodeURIComponent(imagePrompt)}`,
          { responseType: 'arraybuffer' }
        );
        const img = Buffer.from(res.data, 'binary');
        await conn.sendFile(m.chat, img, 'imagine.jpg', null, m);
      } catch (e) {
        console.error(e);
        await m.reply('⚠️ Terjadi kesalahan saat membuat gambar.');
      }
      return true;
    }

    // KIRIM RESPON CHAT
    await conn.sendPresenceUpdate('composing', m.chat);

    if (!filter) {
      const responses = [
        `Hi ${m.name}, gimana kabarnya?`,
        `Ada yang bisa aku bantu, ${m.name}?`,
        `Halo ${m.name}, apa yang ingin kamu tanyakan?`,
      ];
      return m.reply(responses[Math.floor(Math.random() * responses.length)]);
    }

    if (!conn.selfai[m.sender]) conn.selfai[m.sender] = { sessionChat: [] };
    if ([".", "#", "!", "/", "\\"].some(p => filter.startsWith(p))) return;

    const prev = conn.selfai[m.sender].sessionChat || [];
    const messages = [
      { role: "system", content: "Kamu adalah Atri-MD, asisten AI yang ramah dan pintar buatan Dhieka Ananda Aquila." },
      { role: "assistant", content: "Hai, aku Atri-MD! Ada yang bisa kubantu?" },
      ...prev.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
      { role: "user", content: filter }
    ];

    const { data } = await axios.post('https://api.botcahx.eu.org/api/search/openai-custom', {
      message: messages,
      apikey: global.btc
    });

    if (data?.result) {
      await m.reply(data.result);
      conn.selfai[m.sender].sessionChat.push(filter, data.result);
    } else {
      await m.reply('⚠️ Gagal mendapatkan balasan. Coba /reset.');
    }

    return true;
  } catch (e) {
    console.error('AI Error:', e);
    await m.reply('❌ Terjadi kesalahan dalam memproses AI.');
    return true;
  }
};

export default handler;