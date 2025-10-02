import fetch from 'node-fetch'

// Scheduler otomatis kirim cuaca jam 19:50 WIB
function startWeatherScheduler(conn) {
  setInterval(async () => {
    const now = new Date()
    const waktuJakarta = new Intl.DateTimeFormat('id-ID', { 
      timeZone: 'Asia/Jakarta', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }).format(now)

    // cek jam 19:50 WIB
    if (waktuJakarta === "19.50") {
      try {
        const res = await fetch("https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.71.04.1001")
        const data = await res.json()

        const area = data.data.area
        const namaWilayah = area.area_name
        const forecasts = area.forecasts

        let hasil = `🌤️ *Prakiraan Cuaca BMKG*\n📍 Wilayah: ${namaWilayah}\n\n`
        forecasts.forEach(t => {
          hasil += `🕑 ${t.datetime}\n🌦️ ${t.weather_desc}\n🌡️ Suhu: ${t.t}°C\n💧 Kelembaban: ${t.hu}%\n\n`
        })

        // kirim ke semua grup
        for (let jid in conn.chats) {
          if (jid.endsWith('@g.us')) {
            await conn.sendMessage(jid, { text: hasil.trim() })
          }
        }

        // kirim juga ke owner
        if (Array.isArray(global.owner)) {
          for (let [id] of global.owner) {
            await conn.sendMessage(id + '@s.whatsapp.net', { text: hasil.trim() })
          }
        }

        console.log("✅ Prakiraan cuaca terkirim otomatis")

      } catch (e) {
        console.error("⚠️ Gagal ambil data BMKG:", e)
      }
    }
  }, 60000) // cek tiap 1 menit
}

export default {
  async before(m, { conn }) {
    // pastikan scheduler tidak double jalan
    if (!conn.weatherSchedulerStarted) {
      startWeatherScheduler(conn)
      conn.weatherSchedulerStarted = true
    }
  }
}