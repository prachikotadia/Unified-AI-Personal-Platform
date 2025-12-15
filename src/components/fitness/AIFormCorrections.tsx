import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface FormCorrection {
  field: string;
  currentValue: string | number;
  suggestedValue: string | number;
  reason: string;
  severity: 'error' | 'warning' | 'suggestion';
  confidence: number;
}

interface AIFormCorrectionsProps {
  formData: Record<string, any>;
  formType: 'workout' | 'nutrition' | 'measurement' | 'sleep';
  onApplyCorrection?: (field: string, value: any) => void;
}

const AIFormCorrections: React.FC<AIFormCorrectionsProps> = ({
  formData,
  formType,
  onApplyCorrection
}) => {
  const [corrections, setCorrections] = useState<FormCorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedCorrections, setAppliedCorrections] = useState<Set<string>>(new Set());

  useEffect(() => {
    analyzeForm();
  }, [formData, formType]);

  const analyzeForm = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // AI form validation and correction logic
    const mockCorrections: FormCorrection[] = [];

    if (formType === 'workout') {
      if (formData.duration && formData.duration > 180) {
        mockCorrections.push({
          field: 'duration',
          currentValue: formData.duration,
          suggestedValue: Math.min(formData.duration, 120),
          reason: 'Workout duration seems unusually long. Consider breaking into multiple sessions.',
          severity: 'warning',
          confidence: 0.85
        });
      }
      if (formData.calories_burned && formData.duration) {
        const caloriesPerMinute = formData.calories_burned / formData.duration;
        if (caloriesPerMinute > 20) {
          mockCorrections.push({
            field: 'calories_burned',
            currentValue: formData.calories_burned,
            suggestedValue: Math.round(formData.duration * 12),
            reason: 'Calories burned per minute seems high. Average is 8-12 cal/min for moderate intensity.',
            severity: 'suggestion',
            confidence: 0.75
          });
        }
      }
    }

    if (formType === 'nutrition') {
      if (formData.total_calories && formData.total_calories > 5000) {
        mockCorrections.push({
          field: 'total_calories',
          currentValue: formData.total_calories,
          suggestedValue: Math.min(formData.total_calories, 3000),
          reason: 'Calorie intake seems very high. Please double-check your entries.',
          severity: 'warning',
          confidence: 0.90
        });
      }
      if (formData.protein && formData.total_calories) {
        const proteinCalories = formData.protein * 4;
        const proteinPercentage = (proteinCalories / formData.total_calories) * 100;
        if (proteinPercentage > 50) {
          mockCorrections.push({
            field: 'protein',
            currentValue: formData.protein,
            suggestedValue: Math.round((formData.total_calories * 0.3) / 4),
            reason: 'Protein intake is very high. Recommended range is 20-30% of total calories.',
            severity: 'suggestion',
            confidence: 0.80
          });
        }
      }
    }

    if (formType === 'measurement') {
      if (formData.weight && formData.previousWeight) {
        const weightChange = formData.weight - formData.previousWeight;
        if (Math.abs(weightChange) > 5) {
          mockCorrections.push({
            field: 'weight',
            currentValue: formData.weight,
            suggestedValue: formData.previousWeight + (weightChange > 0 ? 2 : -2),
            reason: 'Weight change seems significant. Please verify the measurement.',
            severity: 'warning',
            confidence: 0.85
          });
        }
      }
    }

    if (formType === 'sleep') {
      if (formData.sleepDuration && formData.sleepDuration > 12) {
        mockCorrections.push({
          field: 'sleepDuration',
          currentValue: formData.sleepDuration,
          suggestedValue: Math.min(formData.sleepDuration, 10),
          reason: 'Sleep duration seems unusually long. Please verify the times.',
          severity: 'warning',
          confidence: 0.80
        });
      }
      if (formData.deepSleep && formData.remSleep && formData.lightSleep) {
        const total = formData.deepSleep + formData.remSleep + formData.lightSleep;
        if (Math.abs(total - formData.sleepDuration) > 1) {
          mockCorrections.push({
            field: 'sleepStages',
            currentValue: `${formData.deepSleep + formData.remSleep + formData.lightSleep}h`,
            suggestedValue: `${formData.sleepDuration}h`,
            reason: 'Sleep stage totals don\'t match total sleep duration.',
            severity: 'error',
            confidence: 0.95
          });
        }
      }
    }

    setCorrections(mockCorrections);
    setLoading(false);
  };

  const handleApplyCorrection = (correction: FormCorrection) => {
    if (onApplyCorrection) {
      onApplyCorrection(correction.field, correction.suggestedValue);
    }
    setAppliedCorrections(prev => new Set([...prev, correction.field]));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">AI is analyzing form data...</span>
        </div>
      </div>
    );
  }

  if (corrections.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="text-green-600" size={18} />
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>All good!</strong> No corrections needed. Your form data looks accurate.
          </p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="text-red-600" size={18} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={18} />;
      default:
        return <TrendingUp className="text-blue-600" size={18} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={20} />
        <h4 className="font-semibold">AI Form Corrections</h4>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          {corrections.length} {corrections.length === 1 ? 'suggestion' : 'suggestions'}
        </span>
      </div>

      <div className="space-y-3">
        {corrections.map((correction, index) => (
          <div
            key={index}
            className={`border rounded-lg p-3 ${getSeverityColor(correction.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getSeverityIcon(correction.severity)}
                <span className="font-medium capitalize">{correction.field.replace(/_/g, ' ')}</span>
                <span className="text-xs opacity-75">
                  {Math.round(correction.confidence * 100)}% confidence
                </span>
              </div>
              {appliedCorrections.has(correction.field) && (
                <CheckCircle className="text-green-600" size={16} />
              )}
            </div>
            <p className="text-sm mb-2">{correction.reason}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="opacity-75">Current: </span>
                <span className="font-medium">{correction.currentValue}</span>
                <span className="mx-2">→</span>
                <span className="opacity-75">Suggested: </span>
                <span className="font-medium">{correction.suggestedValue}</span>
              </div>
              {!appliedCorrections.has(correction.field) && onApplyCorrection && (
                <button
                  onClick={() => handleApplyCorrection(correction)}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIFormCorrections;

