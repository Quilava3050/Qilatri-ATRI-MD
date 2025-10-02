import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
	const img = 'https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg'
	const dare = await fetch(`https://api.botcahx.eu.org/api/random/dare?apikey=${btc}`).then(result => result.json())
	conn.sendFile(m.chat, img, 'dare.png', `*DARE*\n\n"${dare.result}"`, m)
}

handler.help = ['dare']
handler.tags = ['game']
handler.command = /^(dare|berani|tantangan)$/i
handler.limit = false

export default handler