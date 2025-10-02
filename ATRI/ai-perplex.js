import https from "https";

// fungsi request ke Perplex API
async function eaiquery(prompt, model = "perplexity-ai") {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: prompt,
      model: model,
      history: []
    });

    const options = {
      hostname: "whatsthebigdata.com",
      port: 443,
      path: "/api/ask-ai/",
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://whatsthebigdata.com",
        referer: "https://whatsthebigdata.com/ai-chat/",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          resolve(result.text);
        } catch (error) {
          reject(error.message);
        }
      });
    });

    req.on("error", (error) => reject(error.message));
    req.write(postData);
    req.end();
  });
}

// fungsi bikin progress bar
function progressBar(percent) {
  let filled = Math.floor(percent / 10);
  let empty = 10 - filled;
  return "▰".repeat(filled) + "▱".repeat(empty) + ` ${percent}%`;
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `⚡ Masukkan pertanyaan!\n\nContoh: *${usedPrefix + command} Siapa presiden Indonesia?*`
    );
  }

  try {
    // react ⏳
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // total waktu loading simulasi (ms)
    const totalTime = 3000; // 3 detik
    const steps = 10;
    const stepDelay = totalTime / steps;

    // kirim pesan progress awal
    let progressMsg = await conn.sendMessage(m.chat, {
      text: `🔄 Memproses pertanyaan...\n${progressBar(0)}\n⏳ Estimasi: ${(totalTime / 1000).toFixed(1)} detik`
    });

    // key pesan yang akan diedit
    let msgKey = progressMsg.key;

    // simulasi progress 0–100 dengan ETA
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, stepDelay));
      let percent = i * 10;
      let eta = ((steps - i) * stepDelay / 1000).toFixed(1);

      try {
        // Mencoba menggunakan sendMessage dengan edit parameter
        await conn.sendMessage(m.chat, { 
          text: `🔄 Memproses pertanyaan...\n${progressBar(percent)}` +
                (percent < 100 ? `\n⏳ Estimasi: ${eta} detik lagi` : ""),
          edit: msgKey
        });
      } catch (e) {
        // Fallback ke relayMessage dengan messageId yang benar
        await conn.relayMessage(
          m.chat,
          {
            protocolMessage: {
              key: msgKey,
              type: 14,
              editedMessage: {
                conversation:
                  `🔄 Memproses pertanyaan...\n${progressBar(percent)}` +
                  (percent < 100 ? `\n⏳ Estimasi: ${eta} detik lagi` : "")
              }
            }
          },
          { messageId: msgKey.id }
        );
      }
    }

    // ambil jawaban AI
    let answer = await eaiquery(text).catch(() => null);
    if (!answer) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("⚠️ Tidak ada respon dari AI.");
    }

    // edit jadi hasil akhir
    try {
      // Mencoba menggunakan sendMessage dengan edit parameter
      await conn.sendMessage(m.chat, {
        text: `✅ *Selesai!*\n\n${answer}`,
        edit: msgKey
      });
    } catch (e) {
      // Fallback ke relayMessage dengan messageId yang benar
      await conn.relayMessage(
        m.chat,
        {
          protocolMessage: {
            key: msgKey,
            type: 14,
            editedMessage: {
              conversation: `✅ *Selesai!*\n\n${answer}`
            }
          }
        },
        { messageId: msgKey.id }
      );
    }

    // react ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply("❌ Terjadi kesalahan. Coba lagi nanti.");
  }
};

handler.command = handler.help = ["ai", "perplex", "chatperplex"];
handler.tags = ["ai"];
handler.limit = true;
handler.daftar = true;

export default handler;