type Target={label:string;url:string}

export function parseTargets():Target[]{
  const raw=import.meta.env.VITE_QR_TARGETS as string|undefined
  const fallback=import.meta.env.VITE_PUBLIC_API_URL as string|undefined
  if(raw&&raw.trim()){
    return raw.split(';').map(s=>{ const [label,url]=s.split('|'); return {label:(label||'TARGET').trim(),url:(url||'').trim().replace(/\/$/,'')} }).filter(t=>!!t.url)
  }
  const single=(fallback||'http://localhost:3000').replace(/\/$/,'')
  return [{label:'DEFAULT',url:single}]
}

export default function NetworkSelector({targets,index,setIndex}:{targets:Target[];index:number;setIndex:(i:number)=>void}){
  return (
    <select className='select' value={index} onChange={e=>setIndex(Number(e.target.value))}>
      {targets.map((t,idx)=>(<option key={idx} value={idx}>{t.label} — {t.url}</option>))}
    </select>
  )
}
