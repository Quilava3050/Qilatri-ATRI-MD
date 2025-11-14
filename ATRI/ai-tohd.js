import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import { Buffer } from 'buffer'
import { Client } from "@gradio/client"
import uploadImage from '../lib/uploadFile.js'
import { fileTypeFromBuffer } from "file-type"
import path from "path"

// ===============================================
// 🧠 MAIN HANDLER
// ===============================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/^image/.test(mime) || /webp/.test(mime))
      return conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })

    // jika belum pilih engine
    const engines = {
      '1': 'iloveimg',
      'iloveimg': 'iloveimg',
      '2': 'gradio',
      'gradio': 'gradio',
      'ai': 'gradio'
    }

    const choice = (args[0] || '').toLowerCase()
    if (!engines[choice]) {
      await conn.sendMessage(m.chat, {
        text: `
✨ *Pilih engine untuk memperjelas gambar (HD)*

1️⃣ I Love IMG — cepat, ringan, cocok untuk foto biasa  
2️⃣ Gradio AI — kualitas tinggi (lebih detail), agak lambat  

📝 Contoh:
> ${usedPrefix + command} 1
> ${usedPrefix + command} gradio
`,
      }, { quoted: m })
      return
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    const img = await q.download()
    const uploadedUrl = await uploadImage(img)

    let resultBuffer
    if (engines[choice] === 'gradio') {
      resultBuffer = await upscaleGradio(uploadedUrl)
    } else {
      resultBuffer = await scrapeUpscaleFromUrl(uploadedUrl, 4)
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    await conn.sendMessage(
      m.chat,
      {
        image: resultBuffer,
        caption: `✅ *Gambar berhasil di-HD-kan!*
🧠 *Engine:* ${engines[choice] === 'gradio' ? 'Gradio AI Upscaler' : 'I Love IMG Upscaler'}
🌐 *Sumber:* ${uploadedUrl}`,
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, {
      text: `❌ *Terjadi kesalahan saat memproses gambar!*\n${e.message || e}`,
    }, { quoted: m })
  }
}

handler.command = /^(hd|jernih)$/i
handler.help = ['hd', 'jernih']
handler.tags = ['ai']
handler.limit = true
handler.daftar = true
export default handler

// ===============================================
// ⚙️ GRADIO AI UPSCALER
// ===============================================
async function upscaleGradio(imageUrl) {
  const client = await Client.connect("tuan2308/Upscaler")
  const res = await fetch(imageUrl)
  const blob = await res.blob()
  const result = await client.predict("/image_properties", { img: blob })
  const outputUrl = result?.data?.[0]?.url || result?.data?.[0]
  if (!outputUrl) throw new Error("Gagal mendapatkan hasil dari Gradio.")
  const finalRes = await fetch(outputUrl)
  return Buffer.from(await finalRes.arrayBuffer())
}

// ===============================================
// ⚙️ I LOVE IMG SCRAPER UPSCALER
// ===============================================
class UpscaleImageAPI {
  api = null
  server = null
  taskId = null
  token = null

  async getTaskId() {
    const { data: html } = await axios.get("https://www.iloveimg.com/upscale-image", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
      },
    })

    const tokenMatches = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g)
    if (!tokenMatches || tokenMatches.length < 2) throw new Error("Token not found.")
    this.token = tokenMatches[1]

    const configMatch = html.match(/var ilovepdfConfig = ({.*?});/s)
    if (!configMatch) throw new Error("Server configuration not found.")
    const configJson = JSON.parse(configMatch[1])
    const servers = configJson.servers
    if (!Array.isArray(servers) || servers.length === 0) throw new Error("Server list is empty.")

    this.server = servers[Math.floor(Math.random() * servers.length)]
    this.taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*['"](\w+)['"]/)?.[1]

    this.api = axios.create({
      baseURL: `https://${this.server}.iloveimg.com`,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Origin": "https://www.iloveimg.com",
        "Referer": "https://www.iloveimg.com/",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K)"
      },
    })

    if (!this.taskId) throw new Error("Task ID not found!")
    return { taskId: this.taskId, server: this.server, token: this.token }
  }

  async uploadFromUrl(imageUrl) {
    if (!this.taskId || !this.api) throw new Error("Run getTaskId() first.")
    const imageResponse = await axios.get(imageUrl, { responseType: "arraybuffer" })
    const fileType = await fileTypeFromBuffer(imageResponse.data)
    if (!fileType || !fileType.mime.startsWith("image/")) throw new Error("Unsupported file type.")

    const buffer = Buffer.from(imageResponse.data, "binary")
    const urlPath = new URL(imageUrl).pathname
    const fileName = path.basename(urlPath) || `image.${fileType.ext}`

    const form = new FormData()
    form.append("name", fileName)
    form.append("chunk", "0")
    form.append("chunks", "1")
    form.append("task", this.taskId)
    form.append("preview", "1")
    form.append("file", buffer, { filename: fileName, contentType: fileType.mime })

    const response = await this.api.post("/v1/upload", form, { headers: form.getHeaders() })
    return response.data
  }

  async upscaleImage(serverFilename, scale = 4) {
    if (!this.taskId || !this.api) throw new Error("Run getTaskId() first.")
    if (scale !== 2 && scale !== 4) throw new Error("Scale must be 2 or 4.")

    const form = new FormData()
    form.append("task", this.taskId)
    form.append("server_filename", serverFilename)
    form.append("scale", scale.toString())

    const response = await this.api.post("/v1/upscale", form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer"
    })
    return response.data
  }
}

async function scrapeUpscaleFromUrl(imageUrl, scale = 4) {
  const upscaler = new UpscaleImageAPI()
  await upscaler.getTaskId()
  const uploadResult = await upscaler.uploadFromUrl(imageUrl)
  if (!uploadResult || !uploadResult.server_filename) throw new Error("Failed to upload image.")
  return await upscaler.upscaleImage(uploadResult.server_filename, scale)
}