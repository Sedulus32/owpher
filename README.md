# Parchi

One-slip inbox PWA. Not a chat. Each inbox stores ONE message. The next send overwrites it.

## Run

Start the local Express + SQLite server (from the project root):

```bash
cd server
npm install
node index.js
```

Then start the Vite dev server (in another terminal from the project root):

```bash
npm install
npx vite
```

Vite proxies `/api` requests to the Express server on port 3001 during development.

## Build & Deploy

```bash
npm run build
```

Serve the `dist/` folder with any static host, and run `server/index.js` alongside it as your API backend.

## Security Notes

- Personal login (username + password) is stored ONLY in IndexedDB on this device, salted and hashed. It never leaves the browser.
- Inbox keys are public and send-only. Anyone with the key can overwrite the slip.
- E2E encryption uses Web Crypto ECDH P-256. Private keys are wrapped with your password in IndexedDB and never sent to the server.
- Only the public key is sent to the server so senders can encrypt messages. The server never sees plaintext.
- Slips auto-delete from the server 5 minutes after the owner first reads them.
- No multi-device sync for auth. Clearing browser data removes your account.
