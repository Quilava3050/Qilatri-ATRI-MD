import { areJidsSameUser } from "@whiskeysockets/baileys";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = async (m, { conn }) => {
  // Pastikan m.chat adalah grup
  if (!m.isGroup) return m.reply("Perintah ini hanya untuk grup.");

  // Ambil data peserta grup langsung dari conn
  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = groupMetadata.participants;

  // Filter semua member selain bot dan pengirim
  const users = participants.filter(
    (u) => !areJidsSameUser(u.id, conn.user.id) && !u.admin
  );

  // Cek kalau tidak ada member yang bisa dikick
  if (users.length === 0) {
    return m.reply("Tidak ada member yang bisa dikeluarkan di grup ini.");
  }

  // Ambil daftar ID untuk dikick
  const kickedUser = users.map((u) => u.id);

  // Proses pengeluaran satu per satu (dengan delay agar aman)
  for (let id of kickedUser) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], "remove");
      await delay(1000); // delay 1 detik antar kick
    } catch (e) {
      console.error("Gagal kick:", id, e);
    }
  }

  // Kirim pesan konfirmasi
  await m.reply(
    `✅ Berhasil mengeluarkan semua member:\n${kickedUser
      .map((v) => "@" + v.split("@")[0])
      .join("\n")}`,
    null,
    { mentions: kickedUser }
  );
};

handler.tags = ["group"];
handler.help = ["kickall"];
handler.command = /^(kickall)$/i;

handler.admin = true; // hanya admin grup
handler.group = true; // hanya di grup
handler.botAdmin = true; // bot harus admin
handler.daftar = true;

export default handler;
