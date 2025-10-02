export async function before(m) {
    let user = db.data.users[m.sender];
    let chat = db.data.chats[m.chat];

    if ((m.chat.endsWith('broadcast') || m.fromMe) && !m.message && !chat.isBanned) return;
    if (!m.text.startsWith('.') && !m.text.startsWith('#') && !m.text.startsWith('!') && !m.text.startsWith('/') && !m.text.startsWith('\/')) return;

    // ✅ Cek Owner
    let senderNum = m.sender.split('@')[0]
    let isOwner = Array.isArray(global.owner)
      ? global.owner.some(([id]) => String(id) === senderNum)
      : false
    if (isOwner) return

    if (user.banned && new Date() * 1 < user.unbanTime) return;

    this.spam = this.spam || {};

    if (m.sender in this.spam) {
        this.spam[m.sender].count++;
        let now = new Date() * 1;
        let lastSpamTime = this.spam[m.sender].lastspam || 0;

        if (now - lastSpamTime <= 5000) { // Spam dalam 5 detik
            if (this.spam[m.sender].count >= 4) { // Spam lebih dari 3x
                let banDuration = 86400000; // 24 jam
                user.banned = true;
                user.unbanTime = now + banDuration;

                let startTime = new Date(now).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });
                let endTime = new Date(user.unbanTime).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' });

                m.reply(`*⚠️ Detected Spamming!!*\n\n⏰ Kamu diban mulai jam *${startTime}* dan baru bisa menggunakan bot lagi jam *${endTime}* (24 jam ban).`);

                setTimeout(() => {
                    user.banned = false;
                    delete user.unbanTime;
                    m.reply('*✅ Ban otomatis telah dicabut!*\nSilakan gunakan bot dengan bijak.');
                }, banDuration);
            }
        } else {
            this.spam[m.sender].count = 1;
        }

        this.spam[m.sender].lastspam = now;
    } else {
        this.spam[m.sender] = {
            jid: m.sender,
            count: 1,
            lastspam: new Date() * 1
        };
    }
}