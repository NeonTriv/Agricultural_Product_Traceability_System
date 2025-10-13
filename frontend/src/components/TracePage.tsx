import { useEffect, useMemo, useState } from 'react'
import { fetchTraceByCode } from '../api/trace'
import { parseTargets } from '../lib/networks'
import ResultModal from './ResultModal'
import type { TraceResponse } from '../types/trace'

export default function TracePage() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code') || ''

  const targets = useMemo(() => parseTargets(), [])
  const [idx, setIdx] = useState(0)
  const base = targets[idx]?.url || 'http://localhost:5001'

  const [data, setData] = useState<TraceResponse | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    setLoading(true); setError(null); setData(null)
    fetchTraceByCode(base, code)
      .then(d => { setData(d); setOpen(true) })
      .catch(e => setError(e?.response?.data?.message || e?.message || 'Fetch failed'))
      .finally(() => setLoading(false))
  }, [code, base])

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <h1 style={{ margin:0 }}>Trace</h1>
        <div style={{ color:'#6b7280' }}>Code: <code>{code || '—'}</code></div>
        <select value={idx} onChange={e=>setIdx(Number(e.target.value))} style={{ marginLeft:'auto', padding:8 }}>
          {targets.map((t, i)=>(<option key={i} value={i}>{t.label} — {t.url}</option>))}
        </select>
      </div>

      {!code && <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>Thiếu <code>?code=...</code></div>}
      {loading && <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>Loading…</div>}
      {error && <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, color:'#b91c1c' }}>Error: {error}</div>}

      {open && data && <ResultModal data={data} onClose={()=>setOpen(false)} />}
    </div>
  )
}
