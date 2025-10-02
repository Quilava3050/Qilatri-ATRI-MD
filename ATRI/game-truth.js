import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
	const img = 'https://i.ibb.co/305yt26/bf84f20635dedd5dde31e7e5b6983ae9.jpg'
        const truth = await fetch(`https://api.botcahx.eu.org/api/random/truth?apikey=${btc}`).then(result => result.json()) 
	conn.sendFile(m.chat, img, 'truth.png', `*TRUTH*\n\n"${truth.result}"`, m)
}
handler.help = ['truth']
handler.tags = ['game']
handler.command = /^(truth|kebenaran|kejujuran)$/i
handler.limit = false

export default handler