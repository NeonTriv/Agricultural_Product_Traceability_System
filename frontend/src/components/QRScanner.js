import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';

const QRScanner = ({ onScanResult, onClose }) => {
  const webcamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" // Use back camera on mobile
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      scanQRCode(imageSrc);
    }
  }, []);

  const scanQRCode = async (imageSrc) => {
    try {
      // Convert base64 to image element
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await codeReader.current.decodeFromImageElement(img);
          if (result) {
            const scannedText = result.getText();
            console.log('QR Code scanned:', scannedText);
            setIsScanning(false);
            onScanResult(scannedText);
          }
        } catch (err) {
          // Continue scanning if no QR code found
          if (isScanning) {
            setTimeout(capture, 100); // Try again after 100ms
          }
        }
      };
      img.src = imageSrc;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      if (isScanning) {
        setTimeout(capture, 100); // Continue scanning
      }
    }
  };

  // Start continuous scanning when webcam is ready
  const onUserMedia = () => {
    setError(null);
    setTimeout(capture, 1000); // Start scanning after 1 second
  };

  const onUserMediaError = (error) => {
    console.error('Webcam error:', error);
    setError('Camera access denied or not available. Please allow camera access and try again.');
    setIsScanning(false);
  };

  const handleRetry = () => {
    setError(null);
    setIsScanning(true);
    setTimeout(capture, 1000);
  };

  // Continue scanning loop
  useEffect(() => {
    if (isScanning && !error) {
      const interval = setInterval(() => {
        if (webcamRef.current && isScanning) {
          capture();
        }
      }, 500); // Scan every 500ms

      return () => clearInterval(interval);
    }
  }, [isScanning, error, capture]);

  return (
    <div className="qr-scanner">
      <div className="scanner-header">
        <h2>Scan QR Code</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry Camera Access
          </button>
        </div>
      ) : (
        <div className="video-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
            onUserMediaError={onUserMediaError}
            className="scanner-video"
          />
          <div className="scanner-overlay">
            <div className="scanner-frame"></div>
            {isScanning && (
              <div className="scanning-indicator">
                <div className="scanning-line"></div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <p className="scanner-instruction">
        {isScanning ? 'Point your camera at a QR code' : 'Processing...'}
      </p>
      
      
    </div>
  );
};

export default QRScanner;