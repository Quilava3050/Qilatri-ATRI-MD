let handler = async (m, { text, usedPrefix, command }) => {
	if (!text) throw `gunakan *${usedPrefix}liststore* untuk melihat daftar pesan yg tersimpan.`
	let msgs = db.data.chats[m.chat].listStr
	if (!(text in msgs)) throw `'${text}' tidak terdaftar di daftar pesan.`
	delete msgs[text]
	m.reply(`\n  [💬] berhasil menghapus pesan di daftar List dengan nama '${text}'.\n`)
}
handler.help = ['dellist']
handler.tags = ['store']
handler.command = /^dellist$/i
handler.admin = true
handler.group = true
handler.daftar = true
export default handler