import { areJidsSameUser } from "@whiskeysockets/baileys"; 
  
 let handler = async (m, { conn, text, participants }) => { 
     let user = m.quoted ? m.quoted.sender : m.mentionedJid?.[0]; 
     if (!user) return m.reply(`❌ Tag atau reply pesan member yang ingin dipromote!`); 
     
    // Check if target is already admin
    let isAdmin = participants.find(v => v.id === user)?.admin
    if (isAdmin) return m.reply('❌ User tersebut sudah menjadi admin!')
    
    // Check if bot trying to promote itself
    if (user === conn.user.jid) return m.reply('❌ Tidak bisa promote bot!')
    
    try {
        await m.reply('🔄 Sedang mempromote...')
        
        await conn.groupParticipantsUpdate(m.chat, [user], "promote"); 
        
        await conn.sendMessage(m.chat, { 
            text: `✅ Berhasil mempromote @${user.split('@')[0]} menjadi admin!`,
            mentions: [user]
        }); 
        
    } catch (e) { 
       console.error(e); 
       m.reply(`❌ Gagal mempromote! Pastikan user ada dalam grup.`); 
     } 
 }; 
  
 handler.help = ["promote"]; 
 handler.tags = ["group"]; 
 handler.command = /^(promote)$/i; 
  
 handler.admin = true; 
 handler.botAdmin = true; 
 handler.group = true; 
handler.daftar = true
  
 export default handler;