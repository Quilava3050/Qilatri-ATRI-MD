import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
   if (!text) throw 'Masukin user IG dulu lahhh!';

   await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

   const apiUrl = `https://api.neoxr.eu/api/igstalk?username=${encodeURIComponent(text)}&apikey=${neoxr}`;
   let res = await fetch(apiUrl);
   let json = await res.json();

   if (!json.status) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      throw 'Ga nemu cuy, username salah kali ya?';
   }

   const { id, photo, name, username, follower, following, post, about, private: isPrivate } = json.data;

   let caption = `
┏━━━━━━༺✪༻━━━━━━┓
     *INSTAGRAM STALKER*
┗━━━━━━༺✪༻━━━━━━┛

✨ ID: *${id}*
🙋‍♂️ Nama: *${name}*
🔗 Username: *@${username}*
🧠 Bio: *${about || 'Gak ada bio'}*

📸 Postingan: *${post.toLocaleString()}*
👀 Followers: *${follower.toLocaleString()}*
🤝 Following: *${following.toLocaleString()}*
🔐 Private: *${isPrivate ? 'Iya' : 'Tidak'}*

🖼️ Thumbnail: ${photo}

━━━✦❘༻༺❘✦━━━
`.trim();

   await conn.sendMessage(m.chat, {
      text: caption
   }, { quoted: m });

   await conn.sendMessage(m.chat, { react: { text: "✔️", key: m.key } });
};

handler.help = ['igstalk <username>'];
handler.tags = ['internet'];
handler.command = /^(igstalk)$/i;
handler.limit = true;
handler.daftar = true

export default handler;