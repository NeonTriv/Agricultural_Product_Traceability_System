import { QRCodeCanvas } from 'qrcode.react'

function buildUrl() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code') || 'TEST123'
  const base = (import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '')
  return { code, url: base }
}

export default function App() {
  const { code, url } = buildUrl()
  return (
    <div style={{textAlign:'center'}}>
      <h1 style={{margin:'0 0 16px'}}>QR</h1>
      <div style={{display:'inline-block', padding:16, border:'1px solid #ddd', borderRadius:12}}>
        <QRCodeCanvas value={url} size={320} includeMargin />
      </div>
      <div style={{marginTop:12}}>
        <small>URL: <code>{url}</code></small>
      </div>
      <div style={{marginTop:6}}>
        <small>Code: <code>{code}</code></small>
      </div>
    </div>
  )
}
