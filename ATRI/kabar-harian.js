import fs from 'fs';
import path from 'path';

// Daftar owner (dengan validasi)
let ownerJid;
try {
    // Pastikan global.owner ada dan valid
    if (!global.owner || !Array.isArray(global.owner) || !global.owner[0]) {
        throw new Error('Owner tidak terdaftar di config!');
    }
    ownerJid = Array.isArray(global.owner[0]) ? 
        global.owner[0][0] + '@s.whatsapp.net' : 
        global.owner[0] + '@s.whatsapp.net';
} catch (e) {
    console.error('Error setting ownerJid:', e);
    ownerJid = '6282113148932@s.whatsapp.net'; // Default owner sebagai fallback
}

// Folder media dengan validasi
const mediaPath = path.join(process.cwd(), 'media');
// Buat folder media jika belum ada
if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
}

// Caption random ala pacaran
const captions = {
    selamat_pagi: [
        "woi bangun, bangun woi",
        "Pagi cinta, bangun woi bangunn aku kangen",
        "Ciee yang baru bangun, selamat pagi sayang..."
    ],
    kabar_siang: [
        "Hai sayang, kamu kemana sihh?sampe dianggurin gini",
        "Selamat siang cinta…",
        "camatt ciangg cayangg… dengerin aku dulu, aku rindu "
    ],
    kabar_malam: [
        "HEHH!!! waktunya tidur, dengerin aku, kamu harus tidur 💖",
        "Malam sayang 🥰… TIDUR GA LU SEKARANG?HAH?TIDORRR",
    ],
    kabar_minggu: [
        "TCHHH!!! kebiasan kamu mah lupaan",
        "kemna aja siihh?HEHMM?kemana aja seharian?",
        "ciee sampe malem gini ga ngabarin"
    ]
};

// Fungsi kirim audio dengan debugging detail
async function sendAudio(conn, fileName, captionArr) {
    try {
        // Debug koneksi
        console.log('🔍 Checking connection...');
        console.log('Connection state:', {
            connected: conn?.user ? true : false,
            user: conn?.user?.id,
            phoneConnected: conn?.phoneConnected
        });

        if (!conn?.user) {
            throw new Error('Bot belum terkoneksi!');
        }

        // Debug file path
        const audioFile = path.join(mediaPath, fileName + '.opus');
        console.log('🔍 File path:', audioFile);
        console.log('File exists:', fs.existsSync(audioFile));

        if (!fs.existsSync(audioFile)) {
            throw new Error(`File ${fileName}.opus tidak ditemukan di folder media! Path: ${audioFile}`);
        }

        // Debug file reading
        console.log('🔍 Reading audio file...');
        let audioData;
        try {
            audioData = fs.readFileSync(audioFile);
            console.log('File size:', audioData.length, 'bytes');
        } catch (e) {
            console.error('File read error:', e);
            throw new Error(`Gagal membaca file audio: ${e.message}`);
        }

        // Debug caption
        const caption = captionArr[Math.floor(Math.random() * captionArr.length)];
        console.log('🔍 Selected caption:', caption);

        // Debug owners
        console.log('🔍 Owner list:', global.owner);
        
        // Kirim ke semua owner dengan timeout
        const sendTimeout = 30000; // 30 detik timeout
        for (let owner of global.owner) {
            const ownerNumber = Array.isArray(owner) ? owner[0] : owner;
            const ownerJid = ownerNumber + '@s.whatsapp.net';
            
            console.log(`🔍 Trying to send to ${ownerJid}...`);
            
            try {
                // Buat promise dengan timeout
                const sendPromise = conn.sendMessage(ownerJid, {
                    audio: audioData,
                    mimetype: 'audio/mpeg',
                    ptt: true,
                    fileName: fileName + '.mp3',
                    caption: caption
                }, {
                    quoted: null,
                    timeout: sendTimeout
                });

                await Promise.race([
                    sendPromise,
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), sendTimeout)
                    )
                ]);

                console.log(`✅ Audio ${fileName} terkirim ke ${ownerJid}`);
                
                // Kirim notifikasi teks sebagai backup
                await conn.sendMessage(ownerJid, {
                    text: `✅ Kabar harian terkirim:\n${caption}`
                });

            } catch (err) {
                console.error(`❌ Gagal kirim ke ${ownerJid}:`, err);
                
                // Coba kirim pesan teks jika audio gagal
                try {
                    await conn.sendMessage(ownerJid, {
                        text: `❌ Gagal kirim audio ${fileName}:\n${caption}\n\nError: ${err.message}`
                    });
                } catch (textErr) {
                    console.error('Gagal kirim notifikasi teks:', textErr);
                }
                continue;
            }
        }
    } catch (e) {
        console.error('❌ Error dalam sendAudio:', e);
        throw e;
    }
}

// Fungsi scheduler dengan debugging detail
export function startDailyAudio(conn) {
    // Setup interval untuk cek koneksi
    const connectionCheck = setInterval(() => {
        if (conn?.user) {
            console.log('✅ Bot terkoneksi, memulai scheduler...');
            clearInterval(connectionCheck);
            initializeScheduler(conn);
        } else {
            console.log('⏳ Menunggu koneksi bot...');
        }
    }, 10000); // Cek setiap 10 detik
}

// Fungsi inisialisasi scheduler setelah terkoneksi
function initializeScheduler(conn) {
    console.log('✅ Kabar harian scheduler dimulai');
    console.log('🔍 Bot info:', {
        id: conn.user.id,
        name: conn.user.name,
        connected: conn.phoneConnected
    });
    
    setInterval(async () => {
        try {
            const now = new Date();
            const day = now.getDay(); // 0 = Minggu, 1 = Senin, ...
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Array jadwal untuk mempermudah pengecekan
            const schedule = [
                { time: { hours: 5, minutes: 0 }, file: 'selamat_pagi', captions: captions.selamat_pagi },
                { time: { hours: 14, minutes: 0 }, file: 'kabar_siang', captions: captions.kabar_siang },
                { time: { hours: 22, minutes: 0 }, file: 'kabar_malam', captions: captions.kabar_malam },
                { time: { hours: 21, minutes: 0 }, file: 'kabar_minggu', captions: captions.kabar_minggu, onlyDay: 0 }
            ];

            // Cek setiap jadwal
            for (let task of schedule) {
                if (hours === task.time.hours && minutes === task.time.minutes) {
                    // Cek hari khusus jika ada
                    if (task.onlyDay !== undefined && day !== task.onlyDay) continue;
                    
                    try {
                        await sendAudio(conn, task.file, task.captions);
                    } catch (e) {
                        console.error(`❌ Gagal mengirim ${task.file}:`, e);
                    }
                }
            }
        } catch (e) {
            console.error('❌ Error dalam scheduler:', e);
        }
    }, 60 * 1000); // cek tiap menit
}