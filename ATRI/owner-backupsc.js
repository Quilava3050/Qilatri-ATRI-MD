import fs from "fs";
import cp, { exec as _exec } from "child_process";
import { promisify } from "util";

let exec = promisify(_exec).bind(cp);

let handler = async (m, { conn, isROwner }) => {
   try {
      let zipFileName = `ATRI-MD_Backup.zip`;

      m.reply("📦 Membuat cadangan file bot... Harap tunggu sebentar.");

      setTimeout(() => {
         if (fs.existsSync("node_modules")) {
            m.reply("⚠️ Direktori *node_modules* tidak disertakan dalam backup.");
         }

         const file = fs.readFileSync(zipFileName);
         conn.sendMessage(
            m.chat,
            {
               document: file,
               mimetype: "application/zip",
               fileName: zipFileName,
               caption: `✅ Backup selesai!\nBerikut file cadangan bot (${zipFileName}).`,
            },
            { quoted: m }
         );

         setTimeout(() => {
            fs.unlinkSync(zipFileName);
            m.reply("🧹 File backup sementara telah dihapus dari server.");
         }, 5000);
      }, 3000);

      setTimeout(() => {
         let zipCommand = `zip -r ${zipFileName} * -x "node_modules/*"`;
         exec(zipCommand, (err, stdout) => {
            if (err) {
               console.error("❌ Error saat membuat ZIP:", err);
               m.reply("Gagal membuat file backup.");
            }
         });
      }, 1000);
   } catch (error) {
      m.reply("❌ Terjadi kesalahan saat proses backup.");
      console.error(error);
   }
};

handler.help = ["svsc"];
handler.tags = ["owner"];
handler.command = ["svsc"];
handler.rowner = true;

export default handler;