import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import * as fileType from 'file-type' 

// === TELEGRAPH ===
export const tele = async (buffer) => {
  const { ext } = await fileType.fromBuffer(buffer) || {}
  const form = new FormData()
  form.append('file', buffer, 'tmp.' + (ext || 'jpg'))

  const res = await fetch('https://telegra.ph/upload?source=bot', {
    method: 'POST',
    body: form
  })
  const img = await res.json()

  if (img.error) throw img.error
  if (Array.isArray(img) && img[0]?.src)
    return 'https://telegra.ph' + img[0].src
  throw new Error('Telegraph upload failed')
}

// === QU.AX ===
export const quax = async (buffer) => {
  const { ext, mime } = await fileType.fromBuffer(buffer) || {}
  const form = new FormData()
  form.append('files[]', buffer, { filename: `file.${ext || 'bin'}`, contentType: mime })

  const { data } = await axios.post('https://qu.ax/upload.php', form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity
  })
  if (data?.files?.[0]?.url) return data.files[0].url
  throw new Error('Qu.ax upload failed')
}

// === CATBOX ===
export const catbox = async (buffer) => {
  const { ext } = await fileType.fromBuffer(buffer) || {}
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity
  })
  return res.data
}

// === MAIN FUNCTION ===
export default async function uploaderTohitam(buffer) {
  const { mime } = await fileType.fromBuffer(buffer) || {}

  if (mime?.startsWith('image/')) {
    try {
      return await tele(buffer)
    } catch {
      try {
        return await quax(buffer)
      } catch {}
    }
  } else if (mime?.startsWith('video/')) {
    try {
      return await quax(buffer)
    } catch {}
  }

  try {
    return await catbox(buffer)
  } catch {
    return null
  }
}
