let ucapan = [
  "Heehee, sama-sama! 😊 Jangan lupa bahagia ya~",
  "Sama-sama, semoga harimu menyenangkan! 🌈",
  "Terima kasih kembali! Kalau butuh bantuan, panggil aku aja 🤖",
  "Iyah, makasih juga udah pakai bot ini! ✨",
  "Sama-sama, jangan spam yaa 😁",
  "Awww, makasih juga! Kamu baik banget 🥰"
];

let handler = async (m, { conn }) => {
  let pesan = ucapan[Math.floor(Math.random() * ucapan.length)];
  await conn.reply(m.chat, pesan, m);
};

handler.customPrefix = /^(makasih min|makasih|makasi|makasih bot|makaci|tq bot|tq min)$/i
handler.command = new RegExp

export default handler