import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  try {
    await m.reply('⏳ Memeriksa apikey...');

    const res = await fetch(`https://api.botcahx.eu.org/api/checkkey?apikey=${global.btc}`);
    const json = await res.json();

    if (!json.status) throw '❌ Gagal mengambil data apikey.';

    const {
      email,
      username,
      limit,
      premium,
      expired,
      todayHit,
      totalHit
    } = json.result;

    const capt = `
乂  *C H E C K   A P I K E Y*

◦ *Email*       : ${email}
◦ *Username*    : ${username}
◦ *Limit*       : ${limit}
◦ *Premium*     : ${premium}
◦ *Expired*     : ${expired}
◦ *Today Hit*   : ${todayHit}
◦ *Total Hit*   : ${totalHit}
`.trim();

    await conn.reply(m.chat, capt, m);
  } catch (e) {
    console.error(e);
    await m.reply('⚠️ Gagal mengambil informasi API. Pastikan API key valid.');
  }
};

handler.command = handler.help = ['checkapi', 'api'];
handler.tags = ['main'];
handler.owner = true;

export default handler;