import axios from 'axios'
import cheerio from 'cheerio'
import schedule from 'node-schedule'

// Simpan jadwal per chat
const newsSchedules = new Map()

// === Fungsi ambil berita Detik ===
async function getLatestNews() {
  const url = 'https://www.detik.com/'
  const headlines = []

  try {
    const { data } = await axios.get(url, { timeout: 10000 })
    const $ = cheerio.load(data)

    $('article h3 a').each((i, el) => {
      const title = $(el).text()?.trim()
      const link = $(el).attr('href')
      if (title && link) headlines.push({ title, link })
    })

    if (!headlines.length) throw new Error('Tidak ada berita ditemukan.')

    const newsText = headlines
      .slice(0, 5)
      .map((v, i) => `📰 *${i + 1}. ${v.title}*\n${v.link}`)
      .join('\n\n')

    return `🔹 *Berita Terkini (Detik.com)* 🔹\n\n${newsText}`

  } catch (err) {
    console.error('[AutoNews][ERROR]', err.message)
    return '⚠️ Gagal mengambil berita terkini dari Detik.com.'
  }
}

// === Fungsi ambil cuaca Jabodetabek (Open-Meteo API) ===
async function getWeatherJabodetabek() {
  try {
    const cities = {
      Jakarta: { lat: -6.2, lon: 106.816666 },
      Bogor: { lat: -6.5944, lon: 106.7892 },
      Depok: { lat: -6.4, lon: 106.8186 },
      Tangerang: { lat: -6.1783, lon: 106.63 },
      Bekasi: { lat: -6.2349, lon: 106.9896 }
    }

    let weatherText = "🌤️ *Cuaca Jabodetabek Hari Ini*\n\n"
    for (const [city, { lat, lon }] of Object.entries(cities)) {
      const { data } = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current_weather: true,
          timezone: 'Asia/Jakarta'
        },
        timeout: 8000
      })
      const weather = data.current_weather
      const status = getWeatherEmoji(weather.weathercode)
      weatherText += `🏙️ *${city}*\n🌡️ ${weather.temperature}°C | 💨 ${weather.windspeed} km/h | ${status}\n\n`
    }

    return weatherText.trim()
  } catch (err) {
    console.error('[AutoWeather][ERROR]', err.message)
    return '⚠️ Gagal mengambil data cuaca.'
  }
}

// === Fungsi bantu konversi weather code ke emoji ===
function getWeatherEmoji(code) {
  if ([0].includes(code)) return '☀️ Cerah'
  if ([1, 2].includes(code)) return '🌤️ Cerah Berawan'
  if ([3].includes(code)) return '☁️ Berawan'
  if ([45, 48].includes(code)) return '🌫️ Berkabut'
  if ([51, 53, 55].includes(code)) return '🌦️ Gerimis'
  if ([61, 63, 65].includes(code)) return '🌧️ Hujan'
  if ([66, 67, 71, 73, 75, 77].includes(code)) return '❄️ Hujan Es'
  if ([80, 81, 82].includes(code)) return '🌧️ Hujan Lebat'
  if ([95, 96, 99].includes(code)) return '🌩️ Badai Petir'
  return '❔ Tidak diketahui'
}

// === Command utama ===
let handler = async (m, { conn, args, command }) => {
  const chatId = m.chat

  if (command === 'berita') {
    await m.reply('⏳ Mengambil berita & cuaca...')
    const [berita, cuaca] = await Promise.all([
      getLatestNews(),
      getWeatherJabodetabek()
    ])
    await conn.sendMessage(chatId, { text: `${cuaca}\n\n${berita}` }, { quoted: m })
    return
  }

  if (command === 'setnews') {
    const [jam, menit] = (args[0] || '').split(':').map(x => parseInt(x))
    if (isNaN(jam) || isNaN(menit))
      return m.reply('❌ Format salah!\nContoh: .setnews 07:00')

    if (newsSchedules.has(chatId)) {
      newsSchedules.get(chatId).cancel()
      newsSchedules.delete(chatId)
    }

    const rule = new schedule.RecurrenceRule()
    rule.tz = 'Asia/Jakarta'
    rule.hour = jam
    rule.minute = menit

    const job = schedule.scheduleJob(rule, async () => {
      console.log(`[AutoNews] Kirim berita otomatis ke ${chatId} pada ${jam}:${menit} WIB`)
      const [berita, cuaca] = await Promise.all([
        getLatestNews(),
        getWeatherJabodetabek()
      ])
      await conn.sendMessage(chatId, { text: `${cuaca}\n\n${berita}` }).catch(console.error)
    })

    newsSchedules.set(chatId, job)
    m.reply(`✅ Auto-berita & cuaca diatur jam *${jam}:${menit} WIB*`)
  }

  if (command === 'testnews') {
    const [berita, cuaca] = await Promise.all([
      getLatestNews(),
      getWeatherJabodetabek()
    ])
    await conn.sendMessage(chatId, { text: `${cuaca}\n\n${berita}` }, { quoted: m })
  }
}

handler.help = ['berita', 'setnews <jam:menit>', 'testnews']
handler.tags = ['info']
handler.command = /^(berita|setnews|testnews)$/i
handler.daftar = true

export default handler