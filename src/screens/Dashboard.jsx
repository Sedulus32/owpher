import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getKeysForUser, addInboxKey, getKeyRecord, setInboxName, getAllInboxNames, addContact, getContacts, updateContact, deleteContact, deleteInboxKey } from '../lib/db'
import { generateInboxKey, generateKeyPair, wrapPrivateKey, encryptMessage, decryptMessage, importPrivateKeyJwk } from '../lib/crypto'

const sessionKeys = {}

export default function Dashboard() {
  const { user, verifyPassword } = useAuth()
  const reqId = useRef(0)
  const [keys, setKeys] = useState([])
  const [selected, setSelected] = useState(null)
  const [slip, setSlip] = useState(null)
  const [targetKey, setTargetKey] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [names, setNames] = useState({})
  const [contacts, setContacts] = useState([])
  const [newContactKey, setNewContactKey] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [copyMsg, setCopyMsg] = useState({})

  useEffect(() => { loadAll() }, [user])

  const loadAll = async () => {
    await loadKeys()
    await loadNames()
    await loadContacts()
  }

  const loadKeys = async () => {
    const k = await getKeysForUser(user)
    setKeys(k)
  }

  const loadNames = async () => {
    const all = await getAllInboxNames()
    const map = {}
    all.forEach(n => { map[n.inboxKey] = n.displayName })
    setNames(map)
  }

  const loadContacts = async () => {
    const c = await getContacts()
    setContacts(c)
  }

  const handleCopyKey = async (key, label) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopyMsg(prev => ({ ...prev, [label]: 'Copied' }))
      setTimeout(() => setCopyMsg(prev => { const next = { ...prev }; delete next[label]; return next; }), 1500)
    } catch {
      setCopyMsg(prev => ({ ...prev, [label]: 'Copy failed' }))
      setTimeout(() => setCopyMsg(prev => { const next = { ...prev }; delete next[label]; return next; }), 1500)
    }
  }

  const handleGenerate = async () => {
    if (keys.length >= 5) return setError('Maximum 5 inbox keys allowed')
    setError('')
    const pwd = window.prompt('Enter your account password to generate a new inbox key:')
    if (!pwd) return
    const valid = await verifyPassword(pwd)
    if (!valid) { setError('Wrong password'); return }
    setLoading(true)
    try {
      const newKey = generateInboxKey()
      const { keyPair, pubJwk } = await generateKeyPair()
      const wrapped = await wrapPrivateKey(keyPair.privateKey, pwd)
      const privJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
      sessionKeys[newKey] = keyPair.privateKey
      const res = await fetch('/api/inboxes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inbox_key: newKey, public_key: JSON.stringify(pubJwk) })
      })
      if (!res.ok) throw new Error('Failed to create inbox on server')
      await addInboxKey(user, newKey, pubJwk, wrapped, privJwk)
      await loadKeys()
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  const handleRenameKey = async (inboxKey) => {
    const current = names[inboxKey] || ''
    const input = window.prompt('Save a name on this phone? Leave blank for more privacy.', current)
    if (input === null) return
    await setInboxName(inboxKey, input)
    await loadNames()
  }

  const handleDeleteKey = async (inboxKey) => {
    const confirmed = window.confirm('Delete this inbox on this phone?')
    if (!confirmed) return
    delete sessionKeys[inboxKey]
    await deleteInboxKey(inboxKey)
    if (selected && selected.inboxKey === inboxKey) { setSelected(null); setSlip(null) }
    await loadKeys()
    await loadNames()
    const clearServer = window.confirm('Also clear the slip on the server?')
    if (clearServer) {
      try { await fetch('/api/inboxes/' + inboxKey, { method: 'DELETE' }) } catch (_) {}
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!newContactKey) return
    await addContact(newContactKey.toUpperCase(), newContactName)
    setNewContactKey('')
    setNewContactName('')
    await loadContacts()
  }

  const handleRenameContact = async (contact) => {
    const input = window.prompt('Save a name on this phone? Leave blank for more privacy.', contact.displayName || '')
    if (input === null) return
    await updateContact(contact.id, { displayName: input })
    await loadContacts()
  }

  const handleDeleteContact = async (id) => {
    await deleteContact(id)
    await loadContacts()
  }

  async function decryptSlip(data, inboxKey) {
    const record = await getKeyRecord(inboxKey)
    if (!record) throw new Error('Key not on this phone')
    let privKey = sessionKeys[inboxKey]
    if (!privKey && record.privateKeyJwk) {
      privKey = await importPrivateKeyJwk(record.privateKeyJwk)
      sessionKeys[inboxKey] = privKey
    }
    if (!privKey) throw new Error('Key not on this phone')
    const plain = await decryptMessage(privKey, data.ciphertext)
    return plain
  }

  async function loadReply(inboxKey) {
    if (!inboxKey) return;
    const req = ++reqId.current;
    setSelected((prev) => prev && prev.inboxKey === inboxKey ? prev : { ...prev, inboxKey });
    const res = await fetch("/api/inbox/" + encodeURIComponent(inboxKey));
    const data = await res.json();
    if (req !== reqId.current) return;
    if (!data || !data.ciphertext) {
      setSlip(null);
      return;
    }
    const text = await decryptSlip(data, inboxKey);
    if (req !== reqId.current) return;
    setSlip({ text });
  }

  function onInboxClick(e, k) {
    e.preventDefault();
    e.stopPropagation();
    setSelected(k);
    loadReply(k.inboxKey);
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const normalizedTarget = targetKey.trim().toUpperCase()
    if (!normalizedTarget || !message) return
    setLoading(true)
    setError('')
    try {
      let pkRes = await fetch('/api/inboxes/' + normalizedTarget + '/public-key')
      if (pkRes.status === 404) {
        const myRecord = await getKeyRecord(normalizedTarget)
        if (myRecord) {
          const regRes = await fetch('/api/inboxes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inbox_key: normalizedTarget, public_key: JSON.stringify(myRecord.publicKeyJwk) })
          })
          if (regRes.ok) pkRes = await fetch('/api/inboxes/' + normalizedTarget + '/public-key')
        }
      }
      if (pkRes.status === 404) {
setError("This key is not on the server. It must be generated on the owner's phone.")
        setLoading(false); return
      }
      if (!pkRes.ok) throw new Error('Failed to look up recipient key')
      const { public_key } = await pkRes.json()
      if (!public_key) throw new Error('Recipient has no public key registered')
      const recipientPubJwk = JSON.parse(public_key)
      const payload = await encryptMessage(recipientPubJwk, message)
      let sendRes = await fetch('/api/send/' + normalizedTarget, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext: payload })
      })
      if (sendRes.status === 404) {
        const myRecord = await getKeyRecord(normalizedTarget)
        if (myRecord) {
          await fetch('/api/inboxes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inbox_key: normalizedTarget, public_key: JSON.stringify(myRecord.publicKeyJwk) })
          })
          sendRes = await fetch('/api/send/' + normalizedTarget, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ciphertext: payload })
          })
        }
      }
      if (sendRes.status === 404) {
        setError('This key is not on the server. It must be generated on the owner phone.')
        setLoading(false); return
      }
      if (!sendRes.ok) throw new Error('Failed to send slip')
      setMessage('')
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0b1220] py-8 dashboard-outer">
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">PARCHI</h1>
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider font-medium">One slip. Next message replaces it.</p>
            </div>
            <Link to="/settings" className="parchi-btn-secondary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Settings
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider section-title">My Inboxes ({keys.length}/5)</p>
            <div className="flex flex-col gap-3">
              {keys.map(k => (
                <div key={k.inboxKey} className="parchi-row flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-[#334155] bg-[#0f172a] transition-all">
                  <button type="button" onClick={(e) => onInboxClick(e, k)} className="flex-1 text-left min-w-0">
                    <span className="block text-sm font-medium text-[#e2e8f0] mb-0.5">{names[k.inboxKey] || 'Unnamed'}</span>
                    <span className="block text-[10px] text-[#94a3b8] font-mono">Key: {k.inboxKey}</span>
                  </button>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => handleCopyKey(k.inboxKey, k.inboxKey)} className="parchi-btn-secondary">{copyMsg[k.inboxKey] || 'Copy'}</button>
                    <button type="button" onClick={() => handleRenameKey(k.inboxKey)} className="parchi-btn-secondary">Rename</button>
                    <button type="button" onClick={() => handleDeleteKey(k.inboxKey)} className="parchi-btn-danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={loading || keys.length >= 5} className="parchi-btn-primary w-full mt-1">
              Generate inbox key
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider section-title">Contact List</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#e2e8f0]">Inbox key</label>
                <input type="text" placeholder="Enter inbox key" value={newContactKey} onChange={e => setNewContactKey(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))} maxLength={12} className="w-full bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#94a3b8] transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#e2e8f0]">Name</label>
                <input type="text" placeholder="Enter name (optional)" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="w-full bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#94a3b8] transition-colors" />
              </div>
              <button onClick={handleAddContact} disabled={!newContactKey} className="parchi-btn-secondary w-full mt-1">Add contact</button>
            </div>
            
            {contacts.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {contacts.map(c2 => (
                  <div key={c2.id} className="parchi-row flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-[#334155] bg-[#0f172a] transition-all">
                    <button type="button" onClick={() => setTargetKey(c2.inboxKey)} className="flex-1 text-left min-w-0">
                      <span className="block text-sm font-medium text-[#e2e8f0] mb-0.5">{c2.displayName || 'Unnamed'}</span>
                      <span className="block text-[10px] text-[#94a3b8] font-mono truncate">{c2.inboxKey}</span>
                    </button>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => handleCopyKey(c2.inboxKey, c2.id)} className="parchi-btn-secondary">{copyMsg[c2.id] || 'Copy'}</button>
                      <button type="button" onClick={() => handleRenameContact(c2)} className="parchi-btn-secondary">Rename</button>
                      <button type="button" onClick={() => handleDeleteContact(c2.id)} className="parchi-btn-danger">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Reply Box - Always visible */}
          <div className="flex flex-col gap-6 p-8 rounded-2xl border border-[#334155] bg-[#0f172a] min-h-[280px]">
            <div className="flex justify-between items-center">
              <p className="text-xl font-semibold text-[#e2e8f0] uppercase tracking-wider section-title">Reply Box</p>
              <button type="button" onClick={() => loadReply(selected.inboxKey)} disabled={loading || !selected} className="parchi-btn-secondary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                Refresh
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {slip ? (
                <div className="w-full p-6 rounded-xl border border-[#334155] bg-[#0b1220]">
                  <p className="text-lg break-words text-[#e2e8f0] leading-relaxed">{slip.text}</p>
                  <p className="text-sm text-[#94a3b8] mt-4 text-right">Deletes 5 minutes after you opened it.</p>
                </div>
              ) : (
                <p className="text-xl text-[#94a3b8]">No slip yet.</p>
              )}
            </div>
          </div>

          {/* Send Slip */}
          <div className="flex flex-col gap-6 p-8 rounded-2xl border border-[#334155] bg-[#0f172a]">
            <p className="text-xl font-semibold text-[#e2e8f0] uppercase tracking-wider section-title">Send Slip</p>
            <form onSubmit={handleSend} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-[#e2e8f0]">Target Inbox Key</label>
                <input type="text" placeholder="Enter target inbox key" value={targetKey} onChange={e => setTargetKey(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))} maxLength={12} className="w-full bg-[#0b1220] text-[#e2e8f0] border border-[#334155] rounded-xl px-4 py-4 text-lg font-mono focus:outline-none focus:border-[#94a3b8] transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-[#e2e8f0]">Message</label>
                <textarea placeholder="Type your message here..." value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full bg-[#0b1220] text-[#e2e8f0] border border-[#334155] rounded-xl px-4 py-4 text-lg resize-none focus:outline-none focus:border-[#94a3b8] transition-colors"></textarea>
              </div>
              <button type="submit" disabled={loading || !targetKey || !message} className="parchi-btn-primary w-full py-4 text-xl font-semibold mt-2">Send</button>
            </form>
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mt-4 text-center">{error}</p>}
    </div>
  )
}