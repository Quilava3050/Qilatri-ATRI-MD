import fetch from 'node-fetch'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

export default async function uploadImage(buffer, uploader = 'idweb') {
  let { ext } = await fileTypeFromBuffer(buffer) || {}
  if (!ext) throw new Error('❌ Jenis file tidak dikenali')

  if (uploader === 'idweb') return await uploadToIdweb(buffer, ext)
  if (uploader === 'catbox') return await uploadToCatbox(buffer, ext)

  throw new Error('Uploader tidak valid. Pilih: idweb atau catbox')
}

// 🔹 idweb.tech uploader
async function uploadToIdweb(buffer, ext) {
  const form = new FormData()
  form.append('file', buffer, `upload.${ext}`)

  const res = await fetch('https://idweb.tech/api/upload.php', {
    method: 'POST',
    body: form
  })
  const text = await res.text()
  if (!res.ok) throw new Error(text)
  if (text.startsWith('http')) return text.trim()
  try {
    const json = JSON.parse(text)
    return json.url || json.result || text
  } catch {
    return text
  }
}

// 🔹 catbox.moe uploader
async function uploadToCatbox(buffer, ext) {
  const form = new FormData()
  form.append('fileToUpload', buffer, `file.${ext}`)
  form.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })
  const data = await res.text()
  if (!res.ok) throw new Error(data)
  return data.trim()
}
