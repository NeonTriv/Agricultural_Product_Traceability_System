import Products from './components/Products'
import ProductInfo from './components/ProductInfo'

export default function App(){
  const path = window.location.pathname
  return path.startsWith('/product') ? <ProductInfo /> : <div className="container"><Products/></div>
}
