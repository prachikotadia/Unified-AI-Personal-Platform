import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Eye, EyeOff } from 'lucide-react';

interface CreditCardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv?: string;
  brand?: string;
  showCvv?: boolean;
  onFlip?: () => void;
  isFlipped?: boolean;
}

const CreditCardPreview: React.FC<CreditCardPreviewProps> = ({
  cardNumber,
  cardholderName,
  expiryMonth,
  expiryYear,
  cvv = '',
  brand = 'Visa',
  showCvv = false,
  onFlip,
  isFlipped = false,
}) => {
  const [showCvvLocal, setShowCvvLocal] = useState(false);

  const getBrandColor = () => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 to-blue-800';
      case 'mastercard':
        return 'from-orange-500 to-red-600';
      case 'amex':
      case 'american express':
        return 'from-green-600 to-teal-700';
      case 'discover':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getBrandLogo = () => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MC';
      case 'amex':
      case 'american express':
        return 'AMEX';
      case 'discover':
        return 'DISCOVER';
      default:
        return 'CARD';
    }
  };

  const formatCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (!cleaned) return '•••• •••• •••• ••••';
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(' ').padEnd(19, '•');
  };

  const formatExpiry = () => {
    if (!expiryMonth || !expiryYear) return 'MM/YY';
    return `${expiryMonth}/${expiryYear.slice(-2)}`;
  };

  return (
    <div className="relative" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-48"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of Card */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-xl shadow-2xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            backgroundImage: `linear-gradient(135deg, ${
              brand.toLowerCase() === 'visa' ? '#1e3a8a, #1e40af' :
              brand.toLowerCase() === 'mastercard' ? '#f97316, #dc2626' :
              brand.toLowerCase() === 'amex' || brand.toLowerCase() === 'american express' ? '#059669, #0d9488' :
              brand.toLowerCase() === 'discover' ? '#fb923c, #ea580c' :
              '#4b5563, #1f2937'
            })`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium opacity-90">Secure Payment</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium opacity-80 mb-1">CARDHOLDER</div>
                <div className="text-sm font-semibold">{getBrandLogo()}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-2xl font-mono font-bold tracking-wider mb-2">
                  {formatCardNumber(cardNumber)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium opacity-80 mb-1">CARDHOLDER NAME</div>
                  <div className="text-sm font-semibold uppercase">
                    {cardholderName || 'YOUR NAME'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium opacity-80 mb-1">EXPIRES</div>
                  <div className="text-sm font-semibold">{formatExpiry()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chip */}
          <div className="absolute top-6 left-6 w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md shadow-lg flex items-center justify-center">
            <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded border-2 border-yellow-200"></div>
          </div>
        </motion.div>

        {/* Back of Card */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-xl shadow-2xl p-6 text-white"
          style={{
            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            backgroundImage: `linear-gradient(135deg, ${
              brand.toLowerCase() === 'visa' ? '#1e3a8a, #1e40af' :
              brand.toLowerCase() === 'mastercard' ? '#f97316, #dc2626' :
              brand.toLowerCase() === 'amex' || brand.toLowerCase() === 'american express' ? '#059669, #0d9488' :
              brand.toLowerCase() === 'discover' ? '#fb923c, #ea580c' :
              '#4b5563, #1f2937'
            })`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="h-12 bg-black mt-4"></div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">CVV</span>
                <button
                  onClick={() => setShowCvvLocal(!showCvvLocal)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {showCvvLocal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-lg font-mono font-bold">
                {showCvvLocal || showCvv ? cvv || '•••' : '•••'}
              </div>
            </div>
            <div className="text-xs text-center opacity-70 mt-4">
              This card is property of the cardholder. If found, please return to the issuer.
            </div>
          </div>
        </motion.div>
      </motion.div>

      {onFlip && (
        <button
          onClick={onFlip}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1 mx-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>{isFlipped ? 'Show Front' : 'Show Back'}</span>
        </button>
      )}
    </div>
  );
};

export default CreditCardPreview;

