import React from 'react';
import { motion } from 'framer-motion';
import { X, Gift, Star, CheckCircle, ArrowRight } from 'lucide-react';

interface FinancialOffer {
  id: string;
  title: string;
  description: string;
  type: 'credit_card' | 'loan' | 'savings' | 'investment';
  benefits: string[];
  eligibility: string;
  rating?: number;
}

interface FinancialOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: FinancialOffer[];
  onApply?: (offerId: string) => void;
  onLearnMore?: (offerId: string) => void;
}

const FinancialOffersModal: React.FC<FinancialOffersModalProps> = ({
  isOpen,
  onClose,
  offers,
  onApply,
  onLearnMore
}) => {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return '💳';
      case 'loan':
        return '💰';
      case 'savings':
        return '🏦';
      case 'investment':
        return '📈';
      default:
        return '🎁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'bg-purple-50 border-purple-200';
      case 'loan':
        return 'bg-blue-50 border-blue-200';
      case 'savings':
        return 'bg-green-50 border-green-200';
      case 'investment':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Gift className="text-yellow-600" size={24} />
            <h2 className="text-xl font-semibold">Personalized Financial Offers</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No offers available at this time</p>
            </div>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className={`border-2 rounded-lg p-5 ${getTypeColor(offer.type)} dark:bg-gray-700/50 dark:border-gray-600 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeIcon(offer.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{offer.title}</h3>
                      {offer.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < offer.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-medium capitalize">
                    {offer.type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">{offer.description}</p>

                {offer.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                      Key Benefits
                    </h4>
                    <ul className="space-y-1">
                      {offer.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600 gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    <strong className="text-gray-900 dark:text-white">Eligibility:</strong> {offer.eligibility}
                  </p>
                  <div className="flex items-center gap-2">
                    {onLearnMore && (
                      <button
                        onClick={() => onLearnMore(offer.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Learn More
                        <ArrowRight size={16} />
                      </button>
                    )}
                    {onApply && (
                      <button
                        onClick={() => onApply(offer.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Now
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialOffersModal;

