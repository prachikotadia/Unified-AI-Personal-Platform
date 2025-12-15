import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Snowflake, Mountain, Calculator, CheckCircle, X, TrendingDown } from 'lucide-react';
import { DebtTracker } from '../../services/financeAPI';

interface PayoffStrategy {
  id: string;
  name: string;
  method: 'snowball' | 'avalanche' | 'hybrid' | 'consolidation';
  description: string;
  totalInterest: number;
  timeToPayoff: number; // months
  monthlyPayment: number;
  savings: number; // compared to minimum payments
  steps: Array<{ debt: string; order: number; amount: number }>;
}

interface AIDebtPayoffStrategyProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtTracker[];
  onApply?: (strategy: PayoffStrategy) => void;
}

const AIDebtPayoffStrategy: React.FC<AIDebtPayoffStrategyProps> = ({
  isOpen,
  onClose,
  debts,
  onApply
}) => {
  const [strategies, setStrategies] = useState<PayoffStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && debts.length > 0) {
      generateStrategies();
    }
  }, [isOpen, debts]);

  const generateStrategies = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const activeDebts = debts.filter(d => d.status === 'active');
    if (activeDebts.length === 0) {
      setLoading(false);
      return;
    }

    const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
    const totalMonthlyPayments = activeDebts.reduce((sum, d) => sum + d.monthly_payment, 0);

    // Snowball Strategy (smallest balance first)
    const snowballDebts = [...activeDebts].sort((a, b) => a.current_balance - b.current_balance);
    const snowballStrategy: PayoffStrategy = {
      id: 'snowball',
      name: 'Debt Snowball',
      method: 'snowball',
      description: 'Pay off smallest debts first for quick wins and motivation',
      totalInterest: calculateTotalInterest(snowballDebts, totalMonthlyPayments * 1.2),
      timeToPayoff: calculatePayoffTime(snowballDebts, totalMonthlyPayments * 1.2),
      monthlyPayment: totalMonthlyPayments * 1.2,
      savings: 0,
      steps: snowballDebts.map((d, i) => ({
        debt: d.name,
        order: i + 1,
        amount: d.current_balance
      }))
    };

    // Avalanche Strategy (highest interest first)
    const avalancheDebts = [...activeDebts].sort((a, b) => b.interest_rate - a.interest_rate);
    const avalancheStrategy: PayoffStrategy = {
      id: 'avalanche',
      name: 'Debt Avalanche',
      method: 'avalanche',
      description: 'Pay off highest interest debts first to save the most money',
      totalInterest: calculateTotalInterest(avalancheDebts, totalMonthlyPayments * 1.2),
      timeToPayoff: calculatePayoffTime(avalancheDebts, totalMonthlyPayments * 1.2),
      monthlyPayment: totalMonthlyPayments * 1.2,
      savings: 0,
      steps: avalancheDebts.map((d, i) => ({
        debt: d.name,
        order: i + 1,
        amount: d.current_balance
      }))
    };

    // Calculate savings
    const minPaymentInterest = calculateTotalInterest(activeDebts, totalMonthlyPayments);
    snowballStrategy.savings = minPaymentInterest - snowballStrategy.totalInterest;
    avalancheStrategy.savings = minPaymentInterest - avalancheStrategy.totalInterest;

    setStrategies([snowballStrategy, avalancheStrategy].sort((a, b) => b.savings - a.savings));
    setLoading(false);
  };

  const calculateTotalInterest = (debts: DebtTracker[], monthlyPayment: number): number => {
    // Simplified calculation
    let totalInterest = 0;
    let remainingDebts = [...debts];
    let extraPayment = monthlyPayment - debts.reduce((sum, d) => sum + d.monthly_payment, 0);

    while (remainingDebts.length > 0) {
      const currentDebt = remainingDebts[0];
      const payment = currentDebt.monthly_payment + (extraPayment > 0 ? extraPayment : 0);
      const interest = (currentDebt.current_balance * currentDebt.interest_rate) / 100 / 12;
      totalInterest += interest;
      
      const principalPayment = payment - interest;
      const newBalance = currentDebt.current_balance - principalPayment;
      
      if (newBalance <= 0) {
        extraPayment = Math.abs(newBalance);
        remainingDebts.shift();
      } else {
        remainingDebts[0] = { ...currentDebt, current_balance: newBalance };
        break;
      }
    }

    return totalInterest;
  };

  const calculatePayoffTime = (debts: DebtTracker[], monthlyPayment: number): number => {
    // Simplified calculation
    const totalDebt = debts.reduce((sum, d) => sum + d.current_balance, 0);
    const avgInterest = debts.reduce((sum, d) => sum + d.interest_rate, 0) / debts.length;
    const monthlyInterest = (totalDebt * avgInterest) / 100 / 12;
    const principalPayment = monthlyPayment - monthlyInterest;
    
    return Math.ceil(totalDebt / principalPayment);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'snowball':
        return <Snowflake className="text-blue-600" size={20} />;
      case 'avalanche':
        return <Mountain className="text-green-600" size={20} />;
      default:
        return <Calculator className="text-purple-600" size={20} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold">AI Debt Payoff Strategy</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-gray-600">Analyzing your debts...</span>
            </div>
          </div>
        ) : strategies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No active debts to analyze</p>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div
                key={strategy.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedStrategy === strategy.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="flex items-start gap-3">
                  {getMethodIcon(strategy.method)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{strategy.name}</h3>
                      {strategy.savings > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Save ${strategy.savings.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Time to Payoff</p>
                        <p className="font-semibold">{strategy.timeToPayoff} months</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Monthly Payment</p>
                        <p className="font-semibold">${strategy.monthlyPayment.toFixed(0)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">Total Interest</p>
                        <p className="font-semibold">${strategy.totalInterest.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Payoff Order:</p>
                      <div className="space-y-1">
                        {strategy.steps.map((step) => (
                          <div key={step.order} className="flex items-center gap-2 text-sm">
                            <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                              {step.order}
                            </span>
                            <span className="flex-1">{step.debt}</span>
                            <span className="text-gray-600">${step.amount.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const strategy = strategies.find(s => s.id === selectedStrategy);
                  if (strategy) {
                    onApply?.(strategy);
                    onClose();
                  }
                }}
                disabled={!selectedStrategy}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Apply Strategy
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIDebtPayoffStrategy;

