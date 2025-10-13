import { useCallback, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import ResultModal from './ResultModal'
import { fetchTraceByCode } from '../api/trace'
import type { TraceResponse } from '../types/trace'

export default function ScannerPanel({baseUrl}:{baseUrl:string}){
  const [lastCode,setLastCode]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [data,setData]=useState<TraceResponse|null>(null)
  const [open,setOpen]=useState(false)

  const handle=useCallback(async(value:string)=>{
    if(!value||value===lastCode||loading) return
    setLastCode(value); setLoading(true); setError(null)
    try{
      const d=await fetchTraceByCode(baseUrl,value)
      setData(d); setOpen(true)
    }catch(e:any){
      setError(e?.response?.data?.message||e?.message||'Fetch failed')
    }finally{
      setLoading(false)
    }
  },[baseUrl,lastCode,loading])

  return (
    <div className="card">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontWeight:700}}>Scanner</div>
        {loading?<span className="muted">Loading…</span>:null}
      </div>
      <div style={{height:10}}/>
      <Scanner
        onDecode={handle}
        onError={(e)=>setError(e?.message||'Camera error')}
        constraints={{facingMode:'environment'}}
        containerStyle={{width:'100%',borderRadius:12,overflow:'hidden'}}
        videoStyle={{width:'100%'}}
      />
      <div style={{marginTop:8}} className="muted">
        {lastCode?<>Last code: <code>{lastCode}</code></>:'Scan a QR…'}
      </div>
      {error&&<div style={{color:'#b91c1c'}}>{error}</div>}
      {open&&data&&<ResultModal data={data} onClose={()=>setOpen(false)}/>}
    </div>
  )
}
