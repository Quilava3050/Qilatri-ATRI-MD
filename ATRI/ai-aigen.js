import https from "https";
import fetch from "node-fetch";

// fungsi query ke perplexity
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
        "origin": "https://whatsthebigdata.com",
        "referer": "https://whatsthebigdata.com/ai-chat/",
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

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(
      `✨ Masukkan pertanyaan atau deskripsi gambar.\n\nContoh:\n${usedPrefix + command} naga di pegunungan gaya anime`
    );

  try {
    // react ⏳
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // tanya perplexity untuk buat prompt gambar
    let refinedPrompt = await eaiquery(
      `Buatkan deskripsi gambar yang detail untuk prompt AI image generator berdasarkan ini: ${text}`
    );

    // buat url gambar
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      refinedPrompt
    )}`;

    // fetch gambar
    let res = await fetch(url);
    if (!res.ok) throw "Gagal generate gambar.";
    let buffer = Buffer.from(await res.arrayBuffer());

    // kirim hasil
    await conn.sendFile(
      m.chat,
      buffer,
      "perplex-img.jpg",
      `✅ *Hasil AI Image*\n\n🎨 Prompt dari Perplexity:\n_${refinedPrompt}_`,
      m
    );

    // react ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Terjadi kesalahan saat generate gambar.");
  }
};

handler.help = ["perpleximg <teks>"];
handler.tags = ["ai", "tools"];
handler.command = /^perpleximg$/i;
handler.limit = true;

export default handler;