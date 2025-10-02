import { areJidsSameUser } from "@whiskeysockets/baileys"; 
  
 let handler = async (m, { conn, participants }) => { 
   let user = m.quoted ? m.quoted.sender : m.mentionedJid?.[0]; 
   if (!user) return m.reply(`❌ Tag atau reply pesan admin yang ingin di demote!`); 
    
    // Check if target is admin
    let isAdmin = participants.find(v => v.id === user)?.admin
    if (!isAdmin) return m.reply('❌ User tersebut bukan admin!')
    
    // Check if bot trying to demote itself
    if (user === conn.user.jid) return m.reply('❌ Tidak bisa demote bot!')
    
    // Check if target is owner
    let isOwner = global.owner.map(([number]) => number + '@s.whatsapp.net').includes(user)
    if (isOwner) return m.reply('❌ Tidak bisa demote owner!')
    
    try {
        await m.reply('🔄 Sedang melepas jabatan admin...')
        
        await conn.groupParticipantsUpdate(m.chat, [user], "demote")
        
        await conn.sendMessage(m.chat, { 
            text: `✅ Berhasil menurunkan @${user.split('@')[0]} dari admin!`,
            mentions: [user]
        })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Gagal menurunkan dari admin! Pastikan user ada dalam grup.')
    }
 }; 
  
 handler.help = ["demote @user"]; 
 handler.tags = ["group"]; 
 handler.command = /^(demote)$/i; 
  
 handler.admin = true; 
 handler.botAdmin = true; 
 handler.group = true; 
handler.daftar = true
  
 export default handler;