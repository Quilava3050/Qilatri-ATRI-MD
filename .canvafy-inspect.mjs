import canvafy from 'canvafy'

const out = {}
out.exports = Object.keys(canvafy)
try {
  if (typeof canvafy.Rank === 'function') {
    const r = new canvafy.Rank()
    out.Rank = Object.getOwnPropertyNames(Object.getPrototypeOf(r)).filter(k => k !== 'constructor')
  }
  if (typeof canvafy.LevelUp === 'function') {
    const l = new canvafy.LevelUp()
    out.LevelUp = Object.getOwnPropertyNames(Object.getPrototypeOf(l)).filter(k => k !== 'constructor')
  }
  if (typeof canvafy.WelcomeLeave === 'function') {
    const w = new canvafy.WelcomeLeave()
    out.WelcomeLeave = Object.getOwnPropertyNames(Object.getPrototypeOf(w)).filter(k => k !== 'constructor')
  }
} catch (e) {
  out.error = String(e)
}

console.log(JSON.stringify(out, null, 2))
