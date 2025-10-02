import uploadImage from '../lib/uploadFile.js'

import { Client } from "@gradio/client";

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime || !mime.startsWith('image/')) {
        throw `Kirim atau reply gambar dengan caption *${usedPrefix + command}*`;
    }

    m.reply('⏳ Menghapus background via Gradio, tunggu sebentar...');
    try {
        const media = await q.download();
        // Convert Buffer to Blob for Gradio client
        const blob = new Blob([media], { type: mime });
        const client = await Client.connect("amirgame197/Remove-Background");
        const result = await client.predict("/predict", { image: blob });
        if (result.data && result.data[0]) {
            let output = result.data[0];
            console.log('Tipe output Gradio:', typeof output, output && output.constructor ? output.constructor.name : '');
            let buffer, filename = 'nobg.png', filetype = 'image/png';
            if (typeof output === 'string' && output.startsWith('http')) {
                let res = await fetch(output);
                buffer = Buffer.from(await res.arrayBuffer());
                filename = output.split('.').pop() === 'webp' ? 'nobg.webp' : 'nobg.png';
                filetype = res.headers.get('content-type') || filetype;
            } else if (typeof output === 'string' && output.startsWith('data:image')) {
                const base64Data = output.split(',')[1];
                buffer = Buffer.from(base64Data, 'base64');
                filename = output.includes('webp') ? 'nobg.webp' : 'nobg.png';
                filetype = output.match(/data:(image\/[^;]+);/)?.[1] || filetype;
            } else if (output instanceof Blob) {
                buffer = Buffer.from(await output.arrayBuffer());
                filename = 'nobg.png';
            } else if (typeof output === 'object' && output !== null && output.url) {
                let res = await fetch(output.url);
                buffer = Buffer.from(await res.arrayBuffer());
                filename = output.url.split('.').pop() === 'webp' ? 'nobg.webp' : 'nobg.png';
                filetype = res.headers.get('content-type') || filetype;
            } else {
                console.log('Isi output tidak dikenali:', output);
                throw 'Format hasil tidak dikenali.';
            }
            // Jika hasil webp, konversi ke image
            if (filename.endsWith('.webp') || filetype === 'image/webp') {
                try {
                    let imgUrl = await uploadImage(buffer);
                    await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption: '*DONE*' }, { quoted: m });
                } catch (e) {
                    console.log('Gagal konversi webp ke image:', e);
                    await conn.sendFile(m.chat, buffer, filename, '', m);
                }
            } else {
                await conn.sendFile(m.chat, buffer, filename, '', m);
            }
        } else {
            console.log('Detail error Gradio:', result);
            throw 'Gagal mendapatkan hasil dari Gradio.';
        }
    } catch (err) {
        console.log('❌ Gagal menghapus background. Error detail:', err);
        throw '❌ Gagal menghapus background. Coba lagi nanti.';
    }
};

handler.help = ['removebg', 'nobg'];
handler.tags = ['ai'];
handler.command = /^(removebg|nobg)$/i;
handler.limit = true;
handler.daftar = true;

export default handler;