import { promises as fs, existsSync, readFileSync, unlinkSync } from 'fs'
import { join, basename } from 'path'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCallback)

const handler = async (m, { conn, isROwner }) => {
   try {
      const currentDir = process.cwd()
      const ATRIDir = join(currentDir, "ATRI") // Changed to frostbite directory
      let zipFileName = join(currentDir, "ATRI-Plugins.zip")
      
      // Cek apakah folder frostbite ada
      if (!existsSync(ATRIDir)) {
         return m.reply("Folder ATRI tidak ditemukan!")
      }
      
      m.reply("📦 *ATRI PLUGINS BACKUP*\n\nSedang memulai proses backup plugins. Harap tunggu...")    
      try {
         // Perintah zip khusus untuk folder frostbite
         let zipCommand = `cd "${currentDir}" && zip -r "${zipFileName}" ATRI/`
         
         await exec(zipCommand)
       
         const file = readFileSync(zipFileName)
         const fileSize = (file.length / (1024 * 1024)).toFixed(2)
         
         await conn.sendMessage(
            m.chat,
            {
               document: file,
               mimetype: "application/zip",
               fileName: basename(zipFileName),
               caption: `✅ *ATRI PLUGINS BACKUP*\n\n📁 Total file: ${(await fs.readdir(ATRIDir)).length} plugins\n📦 Ukuran: ${fileSize} MB`,
            },
            { quoted: m }
         )

         // Hapus file zip setelah 10 detik
         setTimeout(() => {
            if (existsSync(zipFileName)) {
               unlinkSync(zipFileName)
               console.log("File backup plugins telah dihapus dari server.")
            }
         }, 10000)

      } catch (err) {
         console.error("Error during plugins backup process:", err)
         m.reply(`Terjadi kesalahan saat backup plugins: ${err.message}`)
      }
      
   } catch (error) {
      m.reply("Terjadi kesalahan saat melakukan backup plugins.")
      console.error(error)
   }
}

handler.help = ["svplug"]
handler.tags = ["owner"]
handler.command = ["svplug"]
handler.owner = true

export default handler