let handler = async (m, { conn, command }) => {
    const isGroup = m.chat.endsWith('@g.us');
    if (!isGroup) throw "❌ *Fitur ini hanya bisa digunakan dalam grup.*";

    // Cek apakah pengirim admin grup
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.id === m.sender);
    const isAdmin = participant?.admin || false;

    if (!isAdmin) throw "❌ *Fitur ini hanya bisa digunakan oleh admin grup.*";

    let chat = global.db.data.chats[m.chat];
    if (!chat) global.db.data.chats[m.chat] = {};

    switch (command) {
        case 'resetwelcome':
            global.db.data.chats[m.chat].sWelcome = '';
            m.reply('✅ *Pesan welcome berhasil dikembalikan ke default.*');
            break;
        case 'resetbye':
            global.db.data.chats[m.chat].sBye = '';
            m.reply('✅ *Pesan bye berhasil dikembalikan ke default.*');
            break;
        default:
            throw '❌ Perintah tidak dikenal.';
    }
};

handler.help = ['resetwelcome', 'resetbye'];
handler.tags = ['group'];
handler.command = /^(resetwelcome|resetbye)$/i;
handler.group = true;
handler.admin = true;
handler.daftar = true;

export default handler;