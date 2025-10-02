import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

// Owner
global.owner = [
['6282113148932', 'Natsuki Minamo', true],
// <-- Number @lid -->
    
  ['6282113148932', 'Natsuki Minamo', true],
]
global.mods = ['17575045372']
global.prems = ['17575045372']
// Info
global.nomorwa = '6282113148932'
global.packname = '𝐌𝐚𝐝𝐞 𝐖𝐢𝐭𝐡'
global.author = '© Atri-MD'
global.namebot = 'Atri AI Assistant'
global.wm = '© Atri-MD'
global.stickpack = 'Sticker Dibuat oleh ATRI-MD\ngithub.com/ShirokamiRyzen\n\nATRI-MD ESM\n081399797379'
global.stickauth = '© Atri AI Assistant'
global.fotonya = 'https://files.catbox.moe/nxvt5v.jpg'
global.sgc = 'https://chat.whatsapp.com/CJXqrjMcxAwF9LNubbmHCN?mode=r_t'
// Info Wait
global.wait = 'harap tunggu sebentar, Atri sedang memproses'
global.eror = '⚠️ Terjadi kesalahan, coba lagi nanti!'
global.multiplier = 69 
// Apikey
global.lolkey = 'Daftar dan isi disini',
global.neoxr = 'Daftar dan isi disini';
global.lann = 'Daftar dan isi disini'
global.btc = 'Daftar dan isi disini'

// Catatan : Jika Mau Work Fiturnya
// Masukan Apikeymu
// Gapunya Apikey? Ya Daftar
global.APIs = {
    lolkey : "https://api.lolhuman.xyz",
    neoxr: 'https://api.neoxr.eu',
    lann: 'https://api.betabotz.eu.org',
	btc: 'https://api.botcahx.eu.org'
}

/*Apikey*/
global.APIKeys = {
    "https://api.lolhuman.xyz": global.lolkey,
    "https://api.neoxr.eu": global.neoxr,
    'https://api.betabotz.eu.org': global.lann,
	'https://api.botcahx.eu.org': global.btc
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
