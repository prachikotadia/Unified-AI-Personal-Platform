import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AIContentModerationProps {
  content: string;
  onFlagContent?: (reason: string) => void;
  showDetails?: boolean;
}

interface ModerationResult {
  isSafe: boolean;
  confidence: number;
  flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    reason: string;
  }>;
  suggestions: string[];
}

const AIContentModeration: React.FC<AIContentModerationProps> = ({
  content,
  onFlagContent,
  showDetails = false
}) => {
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content.trim()) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // AI-powered content moderation
    const contentLower = content.toLowerCase();
    const flags: ModerationResult['flags'] = [];
    const suggestions: string[] = [];

    // Check for inappropriate content
    if (contentLower.includes('spam') || contentLower.includes('scam')) {
      flags.push({
        type: 'spam',
        severity: 'high',
        reason: 'Potential spam or scam content detected'
      });
    }

    if (contentLower.includes('hate') || contentLower.includes('violence')) {
      flags.push({
        type: 'inappropriate',
        severity: 'high',
        reason: 'Potentially inappropriate content detected'
      });
    }

    // Generate suggestions
    if (content.length < 10) {
      suggestions.push('Consider adding more detail to your post for better engagement');
    }
    if (!content.includes('#')) {
      suggestions.push('Adding hashtags can help increase your post visibility');
    }

    const mockModeration: ModerationResult = {
      isSafe: flags.length === 0,
      confidence: flags.length === 0 ? 0.95 : 0.75,
      flags,
      suggestions
    };

    setModeration(mockModeration);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span>Analyzing content...</span>
      </div>
    );
  }

  if (!moderation || !content.trim()) return null;

  const getStatusIcon = () => {
    if (moderation.isSafe) {
      return <CheckCircle className="text-green-600" size={16} />;
    }
    return <XCircle className="text-red-600" size={16} />;
  };

  const getStatusColor = () => {
    if (moderation.isSafe) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
    }
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="text-blue-600" size={16} />
        <span className="text-xs font-medium">Content Moderation</span>
        {getStatusIcon()}
      </div>

      {moderation.flags.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">Content Flags:</p>
          {moderation.flags.map((flag, index) => (
            <div key={index} className="text-xs mb-1">
              <AlertTriangle className="inline w-3 h-3 mr-1" />
              <span>{flag.reason}</span>
            </div>
          ))}
          {onFlagContent && (
            <button
              onClick={() => onFlagContent(moderation.flags[0].reason)}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              Report Content
            </button>
          )}
        </div>
      )}

      {showDetails && moderation.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1">Suggestions:</p>
          <ul className="space-y-1">
            {moderation.suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs flex items-start gap-1">
                <Brain className="mt-0.5 flex-shrink-0" size={12} />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIContentModeration;

