import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const [from, to] = text.split('|');
  if (!(from && to)) throw `Contoh penggunaan: ${usedPrefix + command} jakarta|bandung`;

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const res = await fetch(`https://api.betabotz.eu.org/api/search/jarak?from=${from}&to=${to}&apikey=${lann}`);
    const json = await res.json();

    if (!json.status) throw `🚩 *Informasi jarak tidak ditemukan.*`;

    const {
      detail,
      asal,
      tujuan,
      estimasi_biaya_bbm: estimasiBiaya,
      arah_penunjuk_jalan: arahPenunjukJalan,
      peta_statis: petaStatis,
      rute
    } = json.message;

    const message =
      `*📍 Rincian Perjalanan*\n\n${detail}\n\n` +
      `*🔸 Titik Keberangkatan:*\n• Nama: ${asal.nama}\n• Alamat: ${asal.alamat}\n• Koordinat: ${asal.koordinat.lat}, ${asal.koordinat.lon}\n\n` +
      `*🔹 Tujuan Akhir:*\n• Nama: ${tujuan.nama}\n• Alamat: ${tujuan.alamat}\n• Koordinat: ${tujuan.koordinat.lat}, ${tujuan.koordinat.lon}\n\n` +
      `*💰 Estimasi Biaya BBM:*\n• Perkiraan Liter: ${estimasiBiaya.total_liter}\n• Perkiraan Biaya: ${estimasiBiaya.total_biaya}\n\n` +
      `*🧭 Petunjuk Arah:*\n${arahPenunjukJalan.map(step => `• Langkah ${step.langkah}: ${step.instruksi} (${step.jarak})`).join('\n')}\n\n` +
      `*🗺️ Peta Rute:*\n${petaStatis}\n\n` +
      `*🚗 Jalur yang Dilewati:*\n${rute}`;

    await conn.sendFile(m.chat, petaStatis, 'peta.png', message, m);
  } catch (e) {
    throw `🚩 *Gagal mendapatkan data jarak. Silakan coba lagi nanti.*`;
  }
};

handler.help = ['jarak'];
handler.tags = ['tools'];
handler.command = ['jarak'];
handler.limit = true;
handler.daftar = true

export default handler;