const handler = async (m, { conn }) => {
  try {
    if (!m.quoted) {
      return m.reply("❌ Balas pesan *ViewOnce* (gambar/video).");
    }

    if (!m.quoted.download) {
      return m.reply("❌ Tidak menemukan media. Pastikan balas pesan *ViewOnce* yang berisi gambar/video.");
    }

    // kasih react loading
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // download media dari pesan view-once
    let media = await m.quoted.download();

    // deteksi mimetype biar bisa kirim ulang sesuai jenisnya
    let mime = m.quoted.mimetype || "";
    let type = mime.split("/")[0]; // "image" / "video"

    if (type === "image") {
      await conn.sendFile(m.chat, media, "viewonce.jpg", "📸 Ini hasil buka *ViewOnce*", m);
    } else if (type === "video") {
      await conn.sendFile(m.chat, media, "viewonce.mp4", "🎥 Ini hasil buka *ViewOnce*", m);
    } else {
      await conn.sendFile(m.chat, media, "viewonce.bin", "📦 Media berhasil diambil", m);
    }

    // sukses → react centang
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("RVO ERROR:", err);

    // gagal → react silang
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Terjadi kesalahan saat memuat media: " + err.message);
  }
};

handler.help = ["rvo", "viewonce", "readviewonce"];
handler.tags = ["tools"];
handler.premium = true;
handler.command = /^((read)?viewonce|rvo)$/i;
handler.daftar = true;

export default handler;