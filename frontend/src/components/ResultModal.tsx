import type { TraceResponse } from '../types/trace'

export default function ResultModal({ data, onClose }: { data: TraceResponse; onClose: () => void }) {
  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          {data.product?.imageUrl && (
            <img src={data.product.imageUrl} alt="" style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 8 }} />
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{data.product?.name || 'Product'}</div>
            <div style={{ color: '#6b7280' }}>Code: <code>{data.code}</code></div>
          </div>
          <button onClick={onClose} aria-label="Close" style={closeBtn}>×</button>
        </div>

        <div style={grid}>
          {data.batch && (
            <Card title="Batch">
              <Row label="Farm">{data.batch.farmName}</Row>
              <Row label="Harvest">{fmt(data.batch.harvestDate)}</Row>
              <Row label="Batch ID">{data.batch.id}</Row>
            </Card>
          )}
          {data.farm && (
            <Card title="Farm">
              <Row label="Name">{data.farm.name}</Row>
              <Row label="Address">{data.farm.address || '—'}</Row>
              {data.farm.certifications?.length ? <Row label="Certs">{data.farm.certifications.join(', ')}</Row> : null}
            </Card>
          )}
          {data.processing && (
            <Card title="Processing">
              <Row label="Facility">{data.processing.facility || '—'}</Row>
              <Row label="Packed at">{fmt(data.processing.packedAt)}</Row>
            </Card>
          )}
          {(data.distributor || data.price) && (
            <Card title="Distribution & Price">
              {data.distributor?.name && <Row label="Distributor">{data.distributor.name}</Row>}
              {data.distributor?.location && <Row label="Location">{data.distributor.location}</Row>}
              {data.price?.amount !== undefined && <Row label="Price">{data.price.amount} {data.price.currency || ''}</Row>}
            </Card>
          )}
        </div>

        <details style={{ marginTop: 12 }}>
          <summary>Raw JSON</summary>
          <pre style={{ background: '#f6f7f8', border: '1px solid #e5e7eb', padding: 12, borderRadius: 10, overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

function fmt(x?: string) { if (!x) return '—'; const d = new Date(x); return isNaN(+d) ? x : d.toLocaleDateString() }
function Card({ title, children }: any) {
  return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
    <div style={{ display: 'grid', gap: 6 }}>{children}</div>
  </section>
}
function Row({ label, children }: any) {
  return <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
    <div style={{ color: '#6b7280' }}>{label}</div>
    <div>{children || '—'}</div>
  </div>
}

const backdrop = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 } as const
const modal = { background: '#fff', borderRadius: 14, maxWidth: 860, width: '100%', padding: 16, border: '1px solid #e5e7eb' } as const
const header = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 } as const
const closeBtn = { marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20, lineHeight: 1 } as const
const grid = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' } as const
