# Owpher

One-slip inbox. Dark, anonymous, ephemeral. Not a chat. Each inbox holds ONE slip. The next send overwrites it.

## What it is

- **One slip only.** The next message replaces the last one.
- **Key is the address.** Share the inbox key, not a password.
- **E2E encrypted (ECDH P-256).** Private keys stay in your browser, wrapped with your password. Server only sees ciphertext.
- **Ephemeral.** Slip auto-deletes from the server 5 minutes after the owner first opens it.

## Pages

- `/` — Home: Owpher intro, Get started → `/login`, How it works → `/how`
- `/login` — Local account (IndexedDB on this device). After login → `/dashboard`
- `/how` — Full guide (6 sections with examples). Starts with: “Owpher is a one-slip inbox...”
- `/dashboard` — Inbox screen (heading says Owpher). Reply Box + Send Slip + inbox list + contacts.
- `/k/:key` — Public send page.

## Run (local)

Start the API server:

```bash
cd server
npm install
node index.js
# listens on process.env.PORT || 8787
```

Then start Vite (proxies `/api` → `http://localhost:8787` when `VITE_API_URL` is empty):

```bash
npm install
npm run dev
```

## Production

- API base: `https://owpher.onrender.com`
- `VITE_API_URL` is set via `.env.production` → `https://owpher.onrender.com`. All `fetch("/api/...")` calls use `fetch(`${API}/api/...`)` where `API = import.meta.env.VITE_API_URL || ""` (local dev stays on Vite proxy).
- CORS on the server allows: `http://localhost:5173`, `https://owpher.vercel.app`, `https://owpher.online`.

```bash
npm run build
```

Serve `dist/` as static. Run `server/index.js` as the API backend.

## Notes

- Login is local-only (IndexedDB). Clearing browser data removes the account.
- Do not send passwords or anything you cannot lose — a slip can be replaced. Free server may sleep, so first send after idle can take ~1 minute.
