import { Client } from "@gradio/client";
import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime || !/image\/(jpe?g|png)/.test(mime)) {
    return m.reply(
      `📸 Balas gambar dengan perintah:\n\n*${usedPrefix + command} <prompt>*\nContoh:\n${usedPrefix + command} ubah jadi anime`
    );
  }

  if (!text) text = "ubah jadi anime"; // default prompt

  try {
    // react ⏳
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    // download gambar dari pesan
    let imgBuffer = await q.download();
    if (!imgBuffer) return m.reply("❌ Gagal download gambar.");

    // Progress update
    m.reply('🔄 Sedang memproses gambar...');
    
    // convert buffer to base64
    const base64Image = imgBuffer.toString('base64');
    
    // koneksi ke Gradio dan prediksi
    const client = await Client.connect("Selfit/ImageEditPro");
    const result = await client.predict("/lambda_4", {
      input_image: `data:image/jpeg;base64,${base64Image}`,
      prompt: text
    });

    // ambil hasil dengan validasi
    if (!result || !result.data) {
      throw new Error("Response tidak valid dari AI");
    }
    
    let output = result.data;
    console.log("AI Response:", output);
    
    if (!output) {
      throw new Error("Tidak ada hasil dari AI");
    }
    
    let buffer;
    try {
      // Handle berbagai format output
      if (typeof output === "string") {
        if (output.startsWith("data:image")) {
          // Handle base64 image
          let base64Data = output.split(",")[1];
          buffer = Buffer.from(base64Data, "base64");
        } else if (output.startsWith("http")) {
          // Handle URL
          let res = await fetch(output, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          buffer = Buffer.from(await res.arrayBuffer());
        } else if (Buffer.isBuffer(output)) {
          // Handle langsung buffer
          buffer = output;
        } else {
          throw new Error("Format output tidak dikenali");
        }
      } else {
        throw new Error("Tipe output tidak valid");
      }
      
      // Validasi hasil buffer
      if (!buffer || buffer.length === 0) {
        throw new Error("Hasil gambar kosong");
      }
      
    } catch (err) {
      console.error("Error processing image:", err);
      throw new Error(`Gagal memproses hasil gambar: ${err.message}`);
    }

    // kirim hasil ke chat
    await conn.sendFile(m.chat, buffer, "edited.png", `✅ Hasil edit: ${text}`, m);

    // react ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error('Error in editpict:', err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    
    // Pesan error yang lebih detail dan solusi
    let errorMessage = "❌ Terjadi kesalahan saat edit gambar.";
    
    if (err.message.includes("timeout")) {
      errorMessage = "❌ Waktu pemrosesan habis. Silakan:\n1. Gunakan gambar yang lebih kecil\n2. Coba lagi dalam beberapa saat\n3. Pastikan koneksi internet stabil";
    } else if (err.message.includes("network") || err.message.includes("ECONNREFUSED")) {
      errorMessage = "❌ Gagal terhubung ke server AI. Silakan:\n1. Coba lagi dalam 1-2 menit\n2. Pastikan koneksi internet stabil";
    } else if (err.message.includes("Tidak ada hasil")) {
      errorMessage = "❌ AI tidak berhasil menghasilkan gambar. Silakan:\n1. Gunakan prompt yang lebih jelas\n2. Pastikan gambar terlihat jelas\n3. Coba dengan gambar lain";
    } else if (err.message.includes("Response tidak valid")) {
      errorMessage = "❌ Server AI sedang maintenance atau sibuk. Silakan:\n1. Coba lagi dalam beberapa menit\n2. Gunakan prompt yang lebih sederhana";
    } else if (err.message.includes("Hasil gambar kosong")) {
      errorMessage = "❌ Hasil edit tidak valid. Silakan:\n1. Gunakan gambar dengan format yang benar\n2. Pastikan ukuran gambar tidak terlalu besar/kecil";
    }
    
    m.reply(errorMessage + "\n\nError detail: " + err.message);
    
    // Hapus reaksi loading jika masih ada
    try {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    } catch {}
  }
};

handler.help = ["editpict <prompt>"];
handler.tags = ["tools", "ai"];
handler.command = /^editpict$/i;
handler.limit = true;

export default handler;