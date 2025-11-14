import bwipjs from 'bwip-js'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Contoh: *.barcode AtriAI123*\nMasukkan teks yang ingin dijadikan barcode.')

  try {
    // buat barcode dengan latar putih
    let png = await bwipjs.toBuffer({
      bcid:        'code128',          // tipe barcode
      text:        text.slice(0, 100), // teks yang dikodekan
      scale:       3,                  // ukuran skala batang
      height:      10,                 // tinggi batang
      includetext: true,               // tampilkan teks di bawah
      textxalign:  'center',           // posisi teks
      backgroundcolor: 'FFFFFF',       // latar putih (hex tanpa #)
      paddingwidth: 10,                // beri sedikit jarak dari tepi
      paddingheight: 10,
    })

    await conn.sendFile(
      m.chat,
      png,
      'barcode.png',
      `✅ Barcode berhasil dibuat!\n📦 Data: ${text}`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal membuat barcode.')
  }
}

handler.help = ['barcode']
handler.tags = ['tools']
handler.command = /^bar(code)?$/i

export default handler