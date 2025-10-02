import util from "util";

const handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply("❌ Balas pesan *ViewOnce* (gambar/video).");

    // Dump full isi m.quoted biar kelihatan
    let structure = util.inspect(m.quoted, { depth: 6, colors: false });
    console.log("=== FULL QUOTED OBJECT ===\n", structure);

    return m.reply(
      "📄 Struktur penuh `m.quoted` sudah dicetak ke console.\nCek terminal untuk melihat di mana `viewOnceMessage` atau media disimpan."
    );
  } catch (err) {
    console.error("RVO DEBUG ERROR:", err);
    m.reply("❌ Error saat debug: " + err.message);
  }
};

handler.help = ["rvodebug"];
handler.tags = ["tools"];
handler.command = /^rvodebug$/i;

export default handler;