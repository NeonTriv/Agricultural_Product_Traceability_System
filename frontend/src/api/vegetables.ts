export type Veg = { ID:number; Name:string; Quantity:number }; // BE -> FE

async function handle<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getAll(): Promise<Veg[]> {
  const r = await fetch('/api/vegetables');
  return handle<Veg[]>(r);
}

export async function getOne(id:number): Promise<Veg> {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`);
  return handle<Veg>(r);
}

export async function create(name:string, quantity:number): Promise<Veg> {
  const r = await fetch('/api/vegetables', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ Name: name, Quantity: quantity }),
  });
  return handle<Veg>(r);
}

export async function rename(id:number, name:string) {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`, {
    method:'PATCH', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ type:'Rename', value: name.trim() }),
  });
  if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function setQuantity(id:number, quantity:number) {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`, {
    method:'PATCH', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ type:'SetQuantity', value: quantity }),
  });
  if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function incQuantity(id:number, by=1) {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`, {
    method:'PATCH', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ type:'IncQuantity', value: by }),
  });
  if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function decQuantity(id:number, by=1) {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`, {
    method:'PATCH', headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ type:'DecQuantity', value: by }),
  });
  if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function remove(id: number): Promise<void> {
  const r = await fetch(`/api/vegetables/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
}