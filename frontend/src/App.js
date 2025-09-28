import React, { useState } from 'react';
import QRScanner from './components/QRScanner';
import ProductDisplay from './components/ProductDisplay';
import './App.css';

function App() {
  const [scannedProductId, setScannedProductId] = useState(null);
  const [productData, setProductData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScanResult = async (productId) => {
    setScannedProductId(productId);
    setIsScanning(false);
    setLoading(true);
    
    // Fetch product data from server
    await fetchProductData(productId);
    setLoading(false);
  };

  const fetchProductData = async (productId) => {
    try {
      console.log('Fetching product data for ID:', productId);
      
      // TODO: Replace with your actual server API endpoint
      // const response = await fetch(`http://your-server-url/api/products/${productId}`);
      // const data = await response.json();
      // setProductData(data);
      
      // Mock data for testing - remove this when you have your server ready
      setTimeout(() => {
        setProductData({
          id: productId,
          name: 'Sample Product',
          description: 'This is a sample product retrieved from QR code scan',
          price: '$29.99',
          category: 'Electronics',
          inStock: true
        });
      }, 1000); // Simulate network delay
      
    } catch (error) {
      console.error('Error fetching product data:', error);
      setProductData({
        id: productId,
        error: 'Failed to fetch product information. Please try again.'
      });
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScannedProductId(null);
    setProductData(null);
    setLoading(false);
  };

  const resetApp = () => {
    setIsScanning(false);
    setScannedProductId(null);
    setProductData(null);
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Product QR Scanner</h1>
        <p>Scan QR codes to get product information</p>
      </header>

      <main className="app-main">
        {!isScanning && !productData && !loading && (
          <div className="start-section">
            <button className="scan-button" onClick={startScanning}>
              Start QR Scan
            </button>
          </div>
        )}

        {isScanning && (
          <QRScanner 
            onScanResult={handleScanResult} 
            onClose={resetApp} 
          />
        )}

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading product information...</p>
          </div>
        )}

        {productData && !loading && (
          <ProductDisplay 
            productData={productData} 
            onScanAgain={startScanning}
            onHome={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;