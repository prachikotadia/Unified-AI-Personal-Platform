import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ScanLine, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (barcodeData: {
    barcode: string;
    productName: string;
    brand: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scanning) {
      // Simulate barcode scanning
      // In a real implementation, you would use a barcode scanning library
      const timer = setTimeout(() => {
        // Mock scanned data
        const mockData = {
          barcode: '1234567890123',
          productName: 'Sample Product',
          brand: 'Sample Brand',
          calories: 250,
          protein: 10,
          carbs: 30,
          fat: 8
        };
        setBarcodeData(mockData);
        setScanned(true);
        setScanning(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, scanning]);

  const handleStartScan = () => {
    setScanning(true);
    setScanned(false);
    setError(null);
    setBarcodeData(null);
  };

  const handleConfirm = () => {
    if (barcodeData) {
      onScanComplete(barcodeData);
      onClose();
      // Reset state
      setScanning(false);
      setScanned(false);
      setBarcodeData(null);
    }
  };

  const handleCancel = () => {
    setScanning(false);
    setScanned(false);
    setBarcodeData(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ScanLine className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Barcode Scanner</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!scanning && !scanned && (
            <div className="text-center py-8">
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Position the barcode within the frame to scan
              </p>
              <button
                onClick={handleStartScan}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <ScanLine size={18} />
                Start Scanning
              </button>
            </div>
          )}

          {scanning && !scanned && (
            <div className="text-center py-8">
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 border-4 border-blue-500 border-dashed animate-pulse"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
                <ScanLine className="w-16 h-16 text-blue-500 animate-pulse" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scanning barcode...
              </p>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}

          {scanned && barcodeData && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-900 dark:text-green-200">Barcode Scanned!</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Barcode: {barcodeData.barcode}
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{barcodeData.productName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{barcodeData.brand}</p>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">Calories</div>
                    <div className="font-medium">{barcodeData.calories}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Protein</div>
                    <div className="font-medium">{barcodeData.protein}g</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Carbs</div>
                    <div className="font-medium">{barcodeData.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fat</div>
                    <div className="font-medium">{barcodeData.fat}g</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Scan Again
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Add to Log
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BarcodeScannerModal;

