let handler = async (m, { conn, text, participants }) => {
  let input = text.split(' ')
  let mentionedJid = m.mentionedJid ? m.mentionedJid : []
  
  // Check format
  if (!text) return m.reply('❌ Format salah!\n\nContoh: *.tagmem @user 5 ayo mabar*')
  if (!mentionedJid[0]) return m.reply('❌ Tag orang yang mau di spam tag!')
  
  let amount = parseInt(input[1])
  if (isNaN(amount)) return m.reply('❌ Jumlah harus berupa angka!')
  if (amount > 20) amount = 20 // Limit max tag
  
  let message = input.slice(2).join(' ')
  let target = mentionedJid[0]
  
  m.reply(`✅ Mulai mentag ${amount}x...`)
  
  for (let i = 0; i < amount; i++) {
    await conn.sendMessage(m.chat, {
      text: `@${target.split('@')[0]} ${message || ''}`,
      mentions: [target]
    })
    // Delay 2 detik antara setiap tag
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  m.reply('✅ Selesai mentag!')
}

handler.help = ['tagmem @user <jumlah> <pesan>']
handler.tags = ['group']
handler.command = /^(tagmem|tagmember)$/i
handler.group = true
handler.admin = false

export default handler