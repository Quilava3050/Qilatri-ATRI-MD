function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function acakKata(kalimat) {
  let kata = kalimat.split(' ')
  for (let i = kata.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[kata[i], kata[j]] = [kata[j], kata[i]]
  }
  return kata.join(' ')
}

const kumpulanKalimat = [
  { kalimat: 'Aku suka makan nasi goreng' },
  { kalimat: 'Dia sedang membaca buku cerita' },
  { kalimat: 'Kami belajar bahasa Indonesia' },
  { kalimat: 'Hari ini cuacanya sangat cerah' },
  { kalimat: 'Ibu pergi ke pasar pagi tadi' },
  { kalimat: 'Anak itu bermain di taman' },
  { kalimat: 'Kita harus menjaga kebersihan' },
  { kalimat: 'Mereka menonton film bersama' },
  { kalimat: 'Ayah bekerja keras setiap hari' },
  { kalimat: 'Saya ingin menjadi orang sukses' },
  { kalimat: 'Kami sedang bermain bola di lapangan' },
  { kalimat: 'Dia memasak ayam goreng di dapur' },
  { kalimat: 'Mereka sedang belajar matematika bersama' },
  { kalimat: 'Aku membeli es krim di warung' },
  { kalimat: 'Ibu membuat kue ulang tahun' },
  { kalimat: 'Ayah sedang mencuci mobil di garasi' },
  { kalimat: 'Kami menanam bunga di taman sekolah' },
  { kalimat: 'Anak-anak bermain layangan di sawah' },
  { kalimat: 'Dia menulis surat untuk temannya' },
  { kalimat: 'Saya membaca koran setiap pagi' },
  { kalimat: 'Kakak mengajariku bermain gitar' },
  { kalimat: 'Mereka berkemah di gunung tinggi' },
  { kalimat: 'Adik suka menggambar pemandangan indah' },
  { kalimat: 'Nenek merajut sweater untuk cucu' },
  { kalimat: 'Kami menikmati matahari terbenam' },
  { kalimat: 'Burung berkicau di pagi hari' },
  { kalimat: 'Petani menanam padi di sawah' },
  { kalimat: 'Nelayan menangkap ikan di laut' },
  { kalimat: 'Guru mengajar dengan penuh semangat' },
  { kalimat: 'Dokter merawat pasien dengan teliti' }
]

const handler = async (m, { conn, usedPrefix, command }) => {
  conn.susunkalimat = conn.susunkalimat || {}
  if (conn.susunkalimat[m.sender]) return m.reply('❗ Kamu masih punya soal yang belum dijawab!')

  const soal = pickRandom(kumpulanKalimat)
  const timeout = 45000

  conn.susunkalimat[m.sender] = {
    jawab: soal.kalimat.toLowerCase(),
    timeout: setTimeout(() => {
      m.reply(`⏰ Waktu habis!\nJawaban yang benar adalah:\n*${soal.kalimat}*`)
      delete conn.susunkalimat[m.sender]
    }, timeout)
  }

  await m.reply(`🧩 Susun kalimat berikut:

*${acakKata(soal.kalimat)}*

🕒 Waktu: 45 detik
✏️ Kirim jawabanmu langsung ke chat.`)
}

handler.before = async (m, { conn }) => {
  conn.susunkalimat = conn.susunkalimat || {}
  if (!conn.susunkalimat[m.sender]) return
  const { jawab, timeout } = conn.susunkalimat[m.sender]
  if (m.text.toLowerCase() === jawab) {
    clearTimeout(timeout)
    await m.reply(`✅ Betul! Jawabannya adalah:\n*${jawab}* 🎉`)
    delete conn.susunkalimat[m.sender]
  }
}

handler.help = ['susunkalimat']
handler.tags = ['game']
handler.command = /^susunkalimat$/i
handler.limit = false

export default handler