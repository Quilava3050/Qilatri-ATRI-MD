//import fetch from "node-fetch"
export async function before(m) {
  this.autosholat = this.autosholat ? this.autosholat : {};
  let who =
    m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.fromMe
      ? this.user.jid
      : m.sender;
  let id = m.chat;
  if (id in this.autosholat) {
    return false;
  }

  // Jadwal sholat Bogor (WIB) — update sesuai kebutuhan
  let jadwalSholat = {
    Imsak: "04:29",
    Fajar: "04:39",
    Sunrise: "05:49",
    Dzuhur: "11:50",
    Asar: "15:10",
    Maghrib: "17:55",
    Isya: "19:05",
  };

  const date = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta", // WIB untuk Bogor
    })
  );
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeNow = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
    if (timeNow === waktu) {
      let caption = `
┏━━━〔 🕌 *Pengingat Sholat* 🕌 〕━━━┓

👤 Hai kak @${who.split`@`[0]}  
⏰ Sekarang pukul *${waktu} WIB*  
📍 Lokasi: *Bogor & sekitarnya*

✨ Waktu *${sholat}* telah tiba  
Ayo ambil wudhu dan jangan menunda sholat 🙂  

┗━━━━━━━━━━━━━━━━━━━━━━┛
      `.trim();

      this.autosholat[id] = [
        this.reply(m.chat, caption, null, {
          contextInfo: {
            mentionedJid: [who],
          },
        }),
        setTimeout(() => {
          delete this.autosholat[id];
        }, 57000),
      ];
    }
  }
}
export const disabled = false;