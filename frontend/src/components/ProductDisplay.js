import React from 'react';

const ProductDisplay = ({ productData, onScanAgain, onHome }) => {
  if (productData.error) {
    return (
      <div className="product-display error">
        <h2>Error</h2>
        <div className="error-card">
          <p>{productData.error}</p>
          <p><strong>Scanned ID:</strong> {productData.id}</p>
        </div>
        <div className="button-group">
          <button className="scan-again-button" onClick={onScanAgain}>
            Try Again
          </button>
          <button className="home-button" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-display">
      <h2>Product Information</h2>
      
      <div className="product-card">
        <div className="product-field">
          <label>Product ID:</label>
          <span>{productData.id}</span>
        </div>
        
        {/* <div className="product-field">
          <label>Name:</label>
          <span>{productData.name}</span>
        </div>
        
        <div className="product-field">
          <label>Description:</label>
          <span>{productData.description}</span>
        </div>
        
        <div className="product-field">
          <label>Price:</label>
          <span>{productData.price}</span>
        </div>

        {productData.category && (
          <div className="product-field">
            <label>Category:</label>
            <span>{productData.category}</span>
          </div>
        )}

        {productData.inStock !== undefined && (
          <div className="product-field">
            <label>In Stock:</label>
            <span className={productData.inStock ? 'in-stock' : 'out-of-stock'}>
              {productData.inStock ? 'Yes' : 'No'}
            </span>
          </div>
        )} */}
      </div>
      
      <div className="button-group">
        <button className="scan-again-button" onClick={onScanAgain}>
          Scan Another Product
        </button>
        <button className="home-button" onClick={onHome}>
          Home
        </button>
      </div>
    </div>
  );
};

export default ProductDisplay;