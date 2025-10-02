import { Client } from "@gradio/client";
import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(
      `📸 Balas gambar dengan perintah:\n*${usedPrefix + command} <prompt>*\nContoh: ${usedPrefix + command} ubah jadi anime`
    );
  }

  if (!text) text = "ubah jadi anime"; // default prompt

  try {
    // react ⏳
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // download gambar
    let imgBuffer = await q.download();
    if (!imgBuffer) return m.reply("❌ Gagal download gambar.");

    // connect ke Gradio
    const client = await Client.connect("Selfit/ImageEditPro");

    // ambil semua input model
    const inputs = client.inputs || [];
    let payload = {};

    for (let input of inputs) {
      if (input.type === "file" && !payload[input.name]) payload[input.name] = imgBuffer;
      if (input.type === "str" && !payload[input.name]) payload[input.name] = text;
    }

    // predict
    const result = await client.predict("/global_edit", payload);

    let output = result.data?.[0];
    if (!output) throw "❌ Gagal edit gambar.";

    // convert hasil ke Buffer
    let buffer;
    if (typeof output === "string" && output.startsWith("data:image")) {
      let base64Data = output.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      let res = await fetch(output);
      buffer = Buffer.from(await res.arrayBuffer());
    }

    // kirim hasil ke chat
    await conn.sendFile(m.chat, buffer, "edited.png", `✅ Hasil edit: ${text}`, m);

    // react ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Terjadi kesalahan saat edit gambar.");
  }
};

handler.help = ["editpict <prompt>"];
handler.tags = ["tools", "ai"];
handler.command = /^editpict$/i;
handler.limit = true;

export default handler;