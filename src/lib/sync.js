import { getQueuedSends, clearQueueItem } from './db'
import { API } from './api'

export async function flushQueue() {
  if (!navigator.onLine) return
  const items = await getQueuedSends()
  for (const item of items) {
    try {
      const res = await fetch(`${API}/api/send/${encodeURIComponent(item.inboxKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciphertext: item.ciphertext })
      })
      if (res.ok) {
        await clearQueueItem(item.id)
      }
    } catch (err) {
      console.error('Failed to flush queue item', item.id, err)
    }
  }
}

window.addEventListener('online', flushQueue)
