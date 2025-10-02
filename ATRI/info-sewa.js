const { generateWAMessageContent, generateWAMessageFromContent } = (await import('@whiskeysockets/baileys')).default;

let handler = async (m, { conn, text, args, command, usedPrefix }) => {
    const sewaList = {
        "1 minggu": 5000,
        "1 bulan": 10000,
        "2 bulan": 15000,
        "3 bulan": 20000,
        "5 bulan": 35000,
        "1 tahun": 85000
    };

    const premiumList = {
        "1 bulan": 10000,
        "1 tahun": 55000
    };

    const paymentInfo = `💳 *Metode Pembayaran*  
1. Dana: 082113148932  
2. Qris: Ketik .payment 

📌 *Setelah melakukan pembayaran, kirim bukti dengan format:*  
📸 *Kirim foto bukti pembayaran dengan caption:*  
\`\`\`.bukti\`\`\``;

    const image = async (url) => {
        const { imageMessage } = await generateWAMessageContent({
            image: { url }
        }, { upload: conn.waUploadToServer });
        return imageMessage;
    };

    const thumbnail = await image('https://h.top4top.io/p_3561ejat61.jpg');
    const isSewa = command === "sewabot";
    const listData = isSewa ? sewaList : premiumList;
    const title = isSewa ? "SEWA BOT ATRI-MD" : "PREMIUM BOT ATRI-MD";

    let duration = text.toLowerCase().trim();

    if (listData[duration]) {
        let price = listData[duration];
        let benefit = isSewa ? '' : '\n🎁 *Keuntungan:* Unlimited limit selama masa premium!';
        conn.reply(m.chat, `✅ *${title} Dipilih*  
🕒 Durasi: *${duration}*  
💰 Harga: *Rp ${price.toLocaleString()}*${benefit}

${paymentInfo}`, m);
    } else {
        const cards = Object.entries(listData).map(([durasi, harga]) => ({
            header: {
                imageMessage: thumbnail,
                hasMediaAttachment: true
            },
            body: {
                text: `▧「 *${title}* 」\n\n📦 Durasi: *${durasi}*\n💰 Harga: *Rp ${harga.toLocaleString()}*${!isSewa ? '\n🎁 Bonus: Unlimited limit selama premium' : ''}\n\nKetik:\n${usedPrefix + command} ${durasi}`
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_copy",
                        buttonParamsJson: `{"display_text":"SALIN FORMAT","id":"format${durasi.replace(/\s/g, '')}","copy_code":"${usedPrefix + command} ${durasi}"}`
                    }
                ]
            }
        }));

        let msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: {
                                text: `📌 PILIHAN ${isSewa ? 'SEWA' : 'PREMIUM'} BOT 📌\n\nKlik tombol untuk salin format order.${!isSewa ? '\n🎁 Semua user premium mendapat unlimited limit!' : ''}`
                            },
                            carouselMessage: {
                                cards,
                                messageVersion: 1
                            }
                        }
                    }
                }
            },
            { quoted: m }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }
};

// Handler untuk ".bukti" dan media dengan caption ".bukti"
handler.before = async (m, { conn }) => {
    const ownerNumber = '6282113148932@s.whatsapp.net';

    const isBukti = m.text?.toLowerCase() === '.bukti' || m.caption?.toLowerCase() === '.bukti';

    if (isBukti) {
        await conn.reply(m.chat, '✅ *Bukti pembayaran telah diterima!*\n📌 *Menunggu konfirmasi dari owner.*\n\n🔗 *Selagi menunggu, kirimkan link grup jika melakukan sewabot.*', m);

        const notif = `📩 *Notifikasi Bukti Pembayaran*\n\n📌 *Pengguna:* @${m.sender.split('@')[0]}\n✅ *Telah mengirim bukti pembayaran!*`;
        await conn.sendMessage(ownerNumber, { text: notif, mentions: [m.sender] });
    }
};

handler.help = ['sewabot', 'premium'];
handler.tags = ['main'];
handler.command = ['sewabot', 'premium'];
handler.daftar = true;

export default handler;