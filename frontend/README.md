# Minimal QR Display (no camera)

- Page shows a *single QR* centered.
- QR encodes: `${VITE_PUBLIC_API_URL}/products/${code}`
- `code` can be provided via query string `?code=...` (default `TEST123`).

## Run
npm i
# IMPORTANT: phones cannot access `localhost`. Set this to your PC LAN IP.
echo VITE_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3000 > .env.local
npm run dev

Open: http://localhost:5173
Scan with phone -> opens backend URL.
