import express from 'express'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, 'data')
mkdirSync(dataDir, { recursive: true })

const DATA_FILE = join(dataDir, 'slips.json')

function load() {
  if (!existsSync(DATA_FILE)) return {}
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function save(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

const allowedOrigins = [
  'http://localhost:5173',
  'https://owpher.vercel.app',
  'https://owpher.online'
]

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

// POST /api/inboxes - create an inbox row
app.post('/api/inboxes', (req, res) => {
  const { inbox_key, public_key } = req.body
  if (!inbox_key || typeof inbox_key !== 'string') {
    return res.status(400).json({ error: 'inbox_key required' })
  }
  const data = load()
  if (!data[inbox_key]) {
    data[inbox_key] = {
      ciphertext: '',
      updated_at: Date.now(),
      read_at: null,
      public_key: public_key || null
    }
  } else {
    data[inbox_key].public_key = public_key || data[inbox_key].public_key
  }
  save(data)
  res.json({ ok: true })
})

// GET /api/inboxes/:inbox_key/public-key - fetch public key for encryption
app.get('/api/inboxes/:inbox_key/public-key', (req, res) => {
  const { inbox_key } = req.params
  const data = load()
  const row = data[inbox_key]
  if (!row) return res.status(404).json({ error: 'Inbox not found' })
  res.json({ public_key: row.public_key })
})

// POST /api/send/:inbox_key - overwrite slip
app.post('/api/send/:inbox_key', (req, res) => {
  const { inbox_key } = req.params
  const { ciphertext } = req.body
  if (typeof ciphertext !== 'string') {
    return res.status(400).json({ error: 'ciphertext required' })
  }
  const data = load()
  if (!data[inbox_key]) {
    return res.status(404).json({ error: 'Inbox not found' })
  }
  data[inbox_key].ciphertext = ciphertext
  data[inbox_key].updated_at = Date.now()
  data[inbox_key].read_at = null
  save(data)
  res.json({ ok: true })
})

// DELETE /api/inboxes/:inbox_key - clear slip on server (owner only action)
app.delete('/api/inboxes/:inbox_key', (req, res) => {
  const { inbox_key } = req.params
  const data = load()
  if (!data[inbox_key]) {
    return res.status(404).json({ error: 'Inbox not found' })
  }
  data[inbox_key].ciphertext = ''
  data[inbox_key].updated_at = Date.now()
  data[inbox_key].read_at = null
  save(data)
  res.json({ ok: true })
})

// GET /api/inbox/:inbox_key - fetch slip, mark read, auto-delete after 5 min
app.get('/api/inbox/:inbox_key', (req, res) => {
  const { inbox_key } = req.params
  const data = load()
  const row = data[inbox_key]

  if (!row) return res.status(404).json({ error: 'Inbox not found' })

  const now = Date.now()
  const FIVE_MINUTES = 5 * 60 * 1000

  // If already read and more than 5 minutes passed, delete ciphertext
  if (row.read_at && now > row.read_at + FIVE_MINUTES) {
    row.ciphertext = ''
    save(data)
    return res.json({ ciphertext: '', read_at: row.read_at })
  }

  // If not yet read and there is a message, set read_at to now
  if (!row.read_at && row.ciphertext) {
    row.read_at = now
    save(data)
    return res.json({ ciphertext: row.ciphertext, read_at: now })
  }

  res.json({ ciphertext: row.ciphertext, read_at: row.read_at })
})

const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  console.log('listening on ' + PORT)
})
