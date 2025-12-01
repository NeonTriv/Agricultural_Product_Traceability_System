import TracePage from './components/TracePage'
import ProductInfo from './components/ProductInfo'
import AdminPage from './components/AdminPage'

export default function App() {
  const path = window.location.pathname

  if (path.startsWith('/admin')) {
    return <AdminPage />
  }

  if (path.startsWith('/product')) {
    return <ProductInfo />
  }

  return <TracePage />
}
