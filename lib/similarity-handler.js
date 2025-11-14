import similarity from 'similarity'

/**
 * Similarity Command System
 * @param {Object} m - message object
 * @param {Object} conn - connection
 * @param {string} body - full message text
 */
export async function handleSimilarity(m, conn, body) {
  try {
    const input = body.trim().toLowerCase()
    const plugins = Object.values(global.ATRI || {})

    // ambil semua command dari plugin
    const commandList = plugins
      .filter(p => p.command)
      .flatMap(p => Array.isArray(p.command) ? p.command : [p.command])
      .map(cmd => cmd.toString().replace(/^\/|\$$/g, '').toLowerCase())

    // cari command paling mirip
    let bestMatch = null
    let bestScore = 0

    for (const cmd of commandList) {
      const score = similarity(input, cmd)
      if (score > bestScore) {
        bestScore = score
        bestMatch = cmd
      }
    }

    // kalau kemiripan di atas 0.7 → eksekusi command
    if (bestScore > 0.7 && bestMatch) {
      const plugin = plugins.find(p =>
        Array.isArray(p.command)
          ? p.command.some(c => c.toString().includes(bestMatch))
          : p.command.toString().includes(bestMatch)
      )
      if (plugin?.handler) {
        console.log(`[SIMILARITY] ${m.sender} → ${bestMatch} (${bestScore.toFixed(2)})`)
        return plugin.handler(m, { conn, text: body })
      }
    }
  } catch (err) {
    console.error('Similarity Error:', err)
  }
}
