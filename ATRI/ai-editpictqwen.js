import { Client } from "@gradio/client";
import fs from "fs";
import { promises as fsPromises } from "fs";
// Untuk Node.js, pastikan Blob tersedia
let BlobClass = globalThis.Blob;
if (!BlobClass) {
  try {
    BlobClass = (await import('buffer')).Blob;
  } catch {}
}

// Handler bot: editpictqwen (Qwen-Image-Edit-Fast)
const handlerQwen = async (m, { conn, args, usedPrefix, command }) => {
  let imagePath, prompt;
  if (m.quoted && /image/.test(m.quoted.mimetype || "")) {
    const media = await m.quoted.download();
    imagePath = `./tmp/editpictqwen_${Date.now()}.jpg`;
    await fsPromises.writeFile(imagePath, media);
    prompt = args.join(" ") || 'edit this image';
  } else if (args.length >= 1) {
    imagePath = args[0];
    prompt = args.slice(1).join(" ") || 'edit this image';
  } else {
    throw `Reply gambar dengan caption *${usedPrefix + command} <prompt>*\nAtau\n*${usedPrefix + command} <path> <prompt>*`;
  }
  await m.reply('_Processing with Qwen-Image-Edit-Fast, please wait..._');
  try {
    // Baca file gambar sebagai blob
    const imageBuffer = await fsPromises.readFile(imagePath);
  const blob = BlobClass ? new BlobClass([imageBuffer]) : imageBuffer;
    // Koneksi ke gradio client
    const client = await Client.connect("multimodalart/Qwen-Image-Edit-Fast");
    const result = await client.predict("/infer", {
      image: blob,
      prompt: prompt,
      seed: 0,
      randomize_seed: true,
      true_guidance_scale: 1,
      num_inference_steps: 4,
      rewrite_prompt: true,
    });
    // Debug log result.data
    await m.reply('Debug result.data: ' + JSON.stringify(result?.data)?.slice(0, 500));
    if (result && result.data) {
      // Jika result.data array dan ada url
      if (Array.isArray(result.data) && result.data[0]?.url) {
        await conn.sendFile(m.chat, result.data[0].url, 'editpictqwen.jpg', '✅ Edit selesai (Qwen)', m);
      } else if (typeof result.data === 'string' && result.data.startsWith('http')) {
        await conn.sendFile(m.chat, result.data, 'editpictqwen.jpg', '✅ Edit selesai (Qwen)', m);
      } else if (typeof result.data === 'string') {
        // Cek apakah base64 image
        if (/^data:image\/(png|jpeg|jpg);base64,/.test(result.data)) {
          const base64 = result.data.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          await conn.sendFile(m.chat, buffer, 'editpictqwen.jpg', '✅ Edit selesai (Qwen)', m);
        } else {
          // Fallback: kirim sebagai dokumen jika bukan url/base64 image
          await m.reply('Format gambar tidak dikenali. Berikut raw data (potongan): ' + result.data.slice(0, 200));
        }
      } else {
        await m.reply('Format data tidak dikenali: ' + typeof result.data);
      }
    } else {
      await m.reply('❌ Gagal mendapatkan hasil edit dari Qwen.');
    }
  } catch (e) {
    await m.reply('❌ Error Qwen: ' + (e.message || e));
  } finally {
    if (imagePath && imagePath.startsWith('./tmp/editpictqwen_')) {
      try { await fsPromises.unlink(imagePath); } catch {}
    }
  }
};

handlerQwen.help = ['editpictqwen <reply gambar/prompt>'];
handlerQwen.tags = ['ai'];
handlerQwen.command = /^(editpictqwen)$/i;
handlerQwen.limit = true;
handlerQwen.daftar = true;

export default handlerQwen;