const soalIQ = [
  { soal: 'Jika 2 + 2 = 4 dan 4 + 4 = 8, maka 8 + 8 = ?', jawaban: '16' },
  { soal: 'Berapa hasil dari 5 x 5 - 10?', jawaban: '15' },
  { soal: 'Jika satu jam = 60 menit, maka 3 jam = ... menit?', jawaban: '180' },
  { soal: 'Dalam satu lusin ada berapa buah?', jawaban: '12' },
  { soal: 'Apa huruf ke-5 dari kata "Pendidikan"?', jawaban: 'd' },
  { soal: 'Jika kamu berlari di urutan ke-3 dan menyalip orang di urutan ke-2, kamu ada di urutan ke berapa?', jawaban: '2' },
  { soal: 'Apa angka setelah 99?', jawaban: '100' },
  { soal: 'Jika A = 1, B = 2, maka Z = ?', jawaban: '26' },
  { soal: 'Jika segitiga memiliki 3 sisi, maka persegi memiliki berapa sisi?', jawaban: '4' },
  { soal: 'Jika hari ini Rabu, maka 2 hari setelah besok adalah?', jawaban: 'sabtu' },
  { soal: 'Apa lawan kata dari "besar"?', jawaban: 'kecil' },
  { soal: 'Berapa jumlah huruf vokal dalam kata "komputer"?', jawaban: '3' },
  { soal: 'Benda apa yang bisa naik tapi tidak pernah turun?', jawaban: 'umur' },
  { soal: 'Jika 7 x 6 = 42, maka 6 x 7 = ?', jawaban: '42' },
  { soal: 'Apa hasil dari 100 dibagi 4?', jawaban: '25' },
  { soal: 'Jika kamu tidur jam 10 malam dan bangun jam 6 pagi, berapa jam kamu tidur?', jawaban: '8' },
  { soal: 'Berapakah 10% dari 200?', jawaban: '20' },
  { soal: 'Negara manakah yang ibu kotanya Jakarta?', jawaban: 'indonesia' },
  { soal: 'Jika kamu punya 5 apel dan makan 2, berapa yang tersisa?', jawaban: '3' },
  { soal: 'Berapa jumlah jari tangan manusia normal?', jawaban: '10' },

  // Tambahan soal sulit
  { soal: 'Jika sebuah mobil melaju 60 km dalam waktu 1 jam, berapa waktu yang dibutuhkan untuk menempuh 180 km?', jawaban: '3' },
  { soal: 'Berapa jumlah segitiga dalam gambar segitiga besar yang dibagi menjadi 4 segitiga kecil?', jawaban: '5' },
  { soal: 'Jika 1 = 5, 2 = 25, 3 = 325, maka 4 = ?', jawaban: '4325' },
  { soal: 'Jika E = MC², maka rumus ini berasal dari teori siapa?', jawaban: 'einstein' },
  { soal: 'Jika hari ini adalah hari sebelum dua hari setelah Senin, hari apakah hari ini?', jawaban: 'selasa' },
  { soal: 'Jika kamu membeli 3 buku seharga Rp15.000 dan membayar dengan Rp50.000, berapa kembaliannya?', jawaban: '5000' },
  { soal: 'Jika semua bebek menghadap ke utara kecuali dua, berapa bebek yang menghadap selatan?', jawaban: '2' },
  { soal: 'Apa huruf ke-3 dari alfabet?', jawaban: 'c' },
  { soal: 'Jika dalam satu minggu ada 7 hari, berapa hari dalam 4 minggu?', jawaban: '28' },
  { soal: 'Berapa hasil dari akar kuadrat dari 121?', jawaban: '11' }
]

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const handler = async (m, { conn, usedPrefix, command }) => {
  conn.testiq = conn.testiq || {}
  if (conn.testiq[m.sender]) return m.reply('❗ Kamu masih punya pertanyaan yang belum dijawab!')

  const soal = pickRandom(soalIQ)
  const timeout = 45000

  conn.testiq[m.sender] = {
    jawab: soal.jawaban.toLowerCase(),
    timeout: setTimeout(() => {
      m.reply(`⏰ Waktu habis!
Jawaban yang benar adalah: *${soal.jawaban}*`)
      delete conn.testiq[m.sender]
    }, timeout)
  }

  await m.reply(`🧠 *TEST IQ*

${soal.soal}

🕒 Waktu: 45 detik
✏️ Kirim jawabanmu langsung ke chat.`)
}

handler.before = async (m, { conn }) => {
  conn.testiq = conn.testiq || {}
  if (!conn.testiq[m.sender]) return
  const { jawab, timeout } = conn.testiq[m.sender]
  if (m.text.toLowerCase() === jawab) {
    clearTimeout(timeout)
    await m.reply(`✅ Benar! Jawabannya adalah: *${jawab}* 🎉`)
    delete conn.testiq[m.sender]
  }
}

handler.help = ['testiq']
handler.tags = ['game']
handler.command = /^testiq$/i
handler.limit = false

export default handler