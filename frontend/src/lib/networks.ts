export type Target = { label: string; url: string }

export function parseTargets(): Target[] {
  const raw = import.meta.env.VITE_QR_TARGETS as string | undefined
  const fallback = import.meta.env.VITE_PUBLIC_API_URL as string | undefined
  if (raw && raw.trim()) {
    return raw.split(';').map(s => {
      const [label, url] = s.split('|')
      return { label: (label || 'TARGET').trim(), url: (url || '').trim().replace(/\/$/, '') }
    }).filter(t => !!t.url)
  }
  const single = (fallback || 'http://localhost:3000').replace(/\/$/, '')
  return [{ label: 'DEFAULT', url: single }]
}

export function getSiteUrl() {
  return (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
}
