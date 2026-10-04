import { openDB } from 'idb'

const DB_NAME = 'parchi-local'
const DB_VERSION = 3

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'username' })
      }
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys', { keyPath: 'inboxKey' })
      }
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('names')) {
          db.createObjectStore('names', { keyPath: 'inboxKey' })
        }
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true })
        }
      }
    }
  })
}

export async function saveAccount(username, passwordHash, salt) {
  const db = await getDb()
  await db.put('accounts', { username, passwordHash, salt })
}

export async function getAccount(username) {
  const db = await getDb()
  return db.get('accounts', username)
}

export async function getAllAccounts() {
  const db = await getDb()
  return db.getAll('accounts')
}

export async function addInboxKey(username, inboxKey, publicKeyJwk, wrappedPrivateKey, privateKeyJwk) {
  const db = await getDb()
  await db.put('keys', { username, inboxKey, publicKeyJwk, wrappedPrivateKey, privateKeyJwk })
}

export async function getKeysForUser(username) {
  const db = await getDb()
  const all = await db.getAll('keys')
  return all.filter(k => k.username === username)
}

export async function getKeyRecord(inboxKey) {
  const db = await getDb()
  return db.get('keys', inboxKey)
}

export async function deleteInboxKey(inboxKey) {
  const db = await getDb()
  await db.delete('keys', inboxKey)
  // Also clean up associated name
  if (db.objectStoreNames.contains('names')) {
    await db.delete('names', inboxKey)
  }
}

export async function enqueueSend(inboxKey, ciphertext) {
  const db = await getDb()
  await db.add('queue', { inboxKey, ciphertext, timestamp: Date.now() })
}

export async function getQueuedSends() {
  const db = await getDb()
  return db.getAll('queue')
}

export async function clearQueueItem(id) {
  const db = await getDb()
  await db.delete('queue', id)
}

// --- Inbox display names (local only) ---

export async function setInboxName(inboxKey, displayName) {
  const db = await getDb()
  if (!displayName || displayName.trim() === '') {
    await db.delete('names', inboxKey)
  } else {
    await db.put('names', { inboxKey, displayName: displayName.trim() })
  }
}

export async function getInboxName(inboxKey) {
  const db = await getDb()
  const rec = await db.get('names', inboxKey)
  return rec ? rec.displayName : ''
}

export async function getAllInboxNames() {
  const db = await getDb()
  return db.getAll('names')
}

// --- Contacts (local only) ---

export async function addContact(inboxKey, displayName) {
  const db = await getDb()
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  await db.add('contacts', { id, inboxKey, displayName: displayName || '' })
  return id
}

export async function getContacts() {
  const db = await getDb()
  return db.getAll('contacts')
}

export async function updateContact(id, data) {
  const db = await getDb()
  const existing = await db.get('contacts', id)
  if (existing) {
    await db.put('contacts', { ...existing, ...data, id })
  }
}

export async function deleteContact(id) {
  const db = await getDb()
  await db.delete('contacts', id)
}