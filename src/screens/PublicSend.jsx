import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { encryptMessage } from '../lib/crypto'
import { enqueueSend } from '../lib/db'
import { API } from '../lib/api'

export default function PublicSend() {
  const { key } = useParams()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message) return
    setLoading(true)
    setStatus('')
    try {
      const inboxKey = key.toUpperCase()
      const pkRes = await fetch(`${API}/api/inboxes/${encodeURIComponent(inboxKey)}/public-key`)
      if (!pkRes.ok) throw new Error('Inbox not found')
      const pkData = await pkRes.json()
      let payload
      if (pkData.public_key) {
        try {
          const pubJwk = JSON.parse(pkData.public_key)
          payload = await encryptMessage(pubJwk, message)
        } catch (encErr) {
          throw new Error('Encryption failed. Message not sent.')
        }
      } else {
        throw new Error('This inbox does not support receiving messages.')
      }
      if (!navigator.onLine) {
        await enqueueSend(inboxKey, payload)
        setStatus('Queued. Will send when online.')
      } else {
        const sendRes = await fetch(`${API}/api/send/${encodeURIComponent(inboxKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ciphertext: payload })
        })
        if (!sendRes.ok) {
          const errData = await sendRes.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to send')
        }
        setStatus('Sent. Previous slip replaced.')
      }
      setMessage('')
    } catch (err) {
      setStatus(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] flex flex-col gap-6 p-8 rounded-2xl border border-[#1c2333] bg-[#0f141f]/80 backdrop-blur">
        <h2 className="text-lg font-semibold text-[#e8e6e1]">Send a slip to {key?.toUpperCase()}</h2>
        <p className="text-xs text-[#8a95a8]">One slip only. Next message replaces this.</p>
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <textarea placeholder="Type your slip..." value={message} onChange={e => setMessage(e.target.value)} rows={4} className="bg-[#070a12] text-[#e8e6e1] border border-[#1c2333] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#c2b5a3]/40"></textarea>
          <button type="submit" disabled={loading || !message} className="bg-[#e8e6e1] text-[#0a0c14] rounded-xl py-3 text-sm font-medium hover:bg-white transition-colors disabled:bg-[#1c2333] disabled:text-[#5a657a]">Send</button>
        </form>
        {status && <p className="text-xs text-[#8a95a8]">{status}</p>}
      </div>
    </div>
  )
}
