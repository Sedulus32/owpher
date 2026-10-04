export async function generateSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const data = enc.encode(password + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export function generateInboxKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
  const len = 10 + Math.floor(Math.random() * 3)
  let result = ''
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  for (let i = 0; i < len; i++) {
    result += chars[arr[i] % chars.length]
  }
  return result
}

export async function generateKeyPair() {
  const kp = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const pubJwk = await crypto.subtle.exportKey('jwk', kp.publicKey)
  return { keyPair: kp, pubJwk }
}

export async function wrapPrivateKey(privateKey, password) {
  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey']
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const wrapped = await crypto.subtle.wrapKey('jwk', privateKey, aesKey, { name: 'AES-GCM', iv })
  return {
    wrapped: btoa(String.fromCharCode(...new Uint8Array(wrapped))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  }
}

export async function unwrapPrivateKey(wrappedData, password) {
  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  const salt = Uint8Array.from(atob(wrappedData.salt), c => c.charCodeAt(0))
  const iv = Uint8Array.from(atob(wrappedData.iv), c => c.charCodeAt(0))
  const wrappedBytes = Uint8Array.from(atob(wrappedData.wrapped), c => c.charCodeAt(0))
  
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    passKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['unwrapKey']
  )
  return crypto.subtle.unwrapKey(
    'jwk', wrappedBytes, aesKey,
    { name: 'AES-GCM', iv },
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  )
}

export async function importPrivateKeyJwk(jwk) {
  return crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  )
}

export async function encryptMessage(publicKeyJwk, plaintext) {
  const pubKey = await crypto.subtle.importKey(
    'jwk', publicKeyJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )
  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  )
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: pubKey }, ephemeral.privateKey, 256
  )
  const aesKey = await crypto.subtle.importKey(
    'raw', shared, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder()
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc.encode(plaintext))
  const ephPub = await crypto.subtle.exportKey('jwk', ephemeral.publicKey)
  return JSON.stringify({
    ephPub,
    iv: btoa(String.fromCharCode(...iv)),
    ct: btoa(String.fromCharCode(...new Uint8Array(ct)))
  })
}

export async function decryptMessage(privateKey, ciphertextJson) {
  const { ephPub, iv, ct } = JSON.parse(ciphertextJson)
  const senderPub = await crypto.subtle.importKey(
    'jwk', ephPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )
  const shared = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: senderPub }, privateKey, 256
  )
  const aesKey = await crypto.subtle.importKey(
    'raw', shared, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  )
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
  const ctBytes = Uint8Array.from(atob(ct), c => c.charCodeAt(0))
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, aesKey, ctBytes)
  return new TextDecoder().decode(plain)
}