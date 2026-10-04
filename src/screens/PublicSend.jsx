import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { encryptMessage } from '../lib/crypto'
import { enqueueSend } from '../lib/db'

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

      const pkRes = await fetch(`/api/inboxes/${encodeURIComponent(inboxKey)}/public-key`)
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
        const sendRes = await fetch(`/api/send/${encodeURIComponent(inboxKey)}`, {
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
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-white">Send a Parchi to {key?.toUpperCase()}</h2>
      <p className="text-xs text-[#94a3b8]">
        One slip only. Next message replaces this.
      </p>
      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <textarea
          placeholder="Type your slip..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="bg-[#0f172a] text-[#e2e8f0] border border-[#334155] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#94a3b8]"
        ></textarea>
        <button
          type="submit"
          disabled={loading || !message}
          className="bg-[#e2e8f0] text-[#0f172a] rounded-xl py-3 text-sm font-medium hover:bg-white transition-colors disabled:bg-[#334155] disabled:text-[#94a3b8]">
          Send
        </button>
      </form>
      {status && <p className="text-xs text-[#94a3b8]">{status}</p>}
    </div>
  )
}
