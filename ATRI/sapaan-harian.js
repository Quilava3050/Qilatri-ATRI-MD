let handler = async (m, { conn }) => {
  const teksPagi = [
    'pagi bestie, semoga hari lo ga chaos ya',
    'selamat pagi, waktunya jadi versi produktif lo hari ini',
    'pagi semua, jangan lupa sarapan biar ga cranky',
    'good morning, mari lawan rasa mager dengan niat setengah',
    'pagi bro, hari baru nih, semangat dulu gapapa nanti rebahan lagi',
    'pagi, jangan lupa minum air putih biar ga dehidrasi kayak hidup',
    'morning, semoga harimu ga terlalu random hari ini',
    'pagi guys, gas lagi hari ini sebelum mood ilang',
    'selamat pagi, jangan overthinking dulu, masih pagi banget woi',
    'pagi bestie, hari baru nih jangan drama dulu ya'
  ]

  const teksSiang = [
    'siang guys, semangat dikit lagi jam pulang',
    'selamat siang, waktunya recharge energi bukan overthink',
    'siang nih, panas banget tapi tetep harus senyum ya',
    'siang bro, jangan lupa makan biar ga cranky',
    'siang semua, vibes-nya mager tapi kerjaan numpuk gapapa itu hidup',
    'siang, jangan terlalu serius, dunia juga bercanda kok',
    'lagi siang nih, waktunya chill bentar abis makan',
    'siang bestie, masih kuat ga? bentar lagi sore kok',
    'selamat siang, tetep santai tapi on track ya',
    'siang, jangan ngeluh dulu baru jam segini woy'
  ]

  const teksSore = [
    'sore bestie, waktunya santai dikit sebelum chaos lagi',
    'selamat sore, udah waktunya chill mode on',
    'sore nih, vibes-nya santai tapi tetep deep inside mikir hal random',
    'sore semua, adem banget ya, cocok buat mikir hal ga penting',
    'sore bro, udah waktunya pelan² nutup hari dengan tenang',
    'sore vibes banget, santai tapi otak masih kerja keras',
    'selamat sore, enaknya kopi atau teh nih buat penenang?',
    'sore gini tuh paling enak buat healing ringan',
    'sore guys, bentar lagi malam, siap² rebahan',
    'sore bestie, ga usah mikir berat dulu ya'
  ]

  const teksMalam = [
    'malam bestie, waktunya chill dan slow down dikit',
    'selamat malam, semoga pikiran lo tenang malam ini',
    'malam nih, waktunya introspeksi tapi jangan terlalu dalem',
    'malam semua, tenang aja hari ini udah lo lewatin',
    'malam vibes: tenang, adem, tapi tetep ada mikir dikit gapapa',
    'selamat malam, udah waktunya break dari drama duniawi',
    'malam bro, santai dulu bentar, hidup ga usah buru²',
    'malam bestie, nikmatin aja prosesnya hari ini',
    'malam, waktunya chill sebelum ngelawan dunia besok lagi',
    'selamat malam, hidup emang random tapi lo keren kok'
  ]

  // ambil teks pesan
  const text = m.text.toLowerCase()

  let teks = null
  if (/\bpagi\b/i.test(text)) teks = teksPagi
  else if (/\bsiang\b/i.test(text)) teks = teksSiang
  else if (/\bsore\b/i.test(text)) teks = teksSore
  else if (/\bmalam\b/i.test(text)) teks = teksMalam

  if (!teks) return

  // random respon
  const randomTeks = teks[Math.floor(Math.random() * teks.length)]
  await conn.sendMessage(m.chat, { text: randomTeks }, { quoted: m })
}

// biar trigger kalau user ngetik kalimat yg mengandung kata tsb
handler.customPrefix = /^(.*\b(pagi|siang|sore|malam)\b.*)$/i
handler.command = new RegExp()

export default handler