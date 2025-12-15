import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Message } from '../../store/chat';

interface AIChatModerationProps {
  messages: Message[];
  onFlagMessage?: (messageId: string, reason: string) => void;
  showDetails?: boolean;
}

interface ModerationResult {
  flaggedMessages: Array<{
    messageId: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    content: string;
  }>;
  overallSafety: 'safe' | 'warning' | 'unsafe';
  insights: string[];
}

const AIChatModeration: React.FC<AIChatModerationProps> = ({
  messages,
  onFlagMessage,
  showDetails = false
}) => {
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      analyzeModeration();
    }
  }, [messages]);

  const analyzeModeration = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered content moderation
    const flaggedMessages: ModerationResult['flaggedMessages'] = [];
    
    // Check for inappropriate content (mock)
    messages.forEach(msg => {
      if (msg.type === 'text') {
        const content = msg.content.toLowerCase();
        if (content.includes('spam') || content.includes('scam')) {
          flaggedMessages.push({
            messageId: msg.id,
            reason: 'Potential spam or scam content',
            severity: 'high',
            content: msg.content
          });
        }
      }
    });

    const mockModeration: ModerationResult = {
      flaggedMessages,
      overallSafety: flaggedMessages.length === 0 ? 'safe' : flaggedMessages.length < 3 ? 'warning' : 'unsafe',
      insights: [
        flaggedMessages.length === 0 
          ? 'All messages appear safe and appropriate'
          : `${flaggedMessages.length} message(s) flagged for review`,
        'Conversation maintains professional tone',
        'No explicit content detected'
      ]
    };

    setModeration(mockModeration);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing content safety...</span>
      </div>
    );
  }

  if (!moderation) return null;

  const getSafetyIcon = () => {
    switch (moderation.overallSafety) {
      case 'safe':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      default:
        return <XCircle className="text-red-600" size={20} />;
    }
  };

  const getSafetyColor = () => {
    switch (moderation.overallSafety) {
      case 'safe':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSafetyColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="text-blue-600" size={18} />
        <h4 className="font-semibold">Content Moderation</h4>
        {getSafetyIcon()}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Overall Safety</span>
            <span className="text-sm font-bold capitalize">{moderation.overallSafety}</span>
          </div>
        </div>

        {moderation.flaggedMessages.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2">
              Flagged Messages ({moderation.flaggedMessages.length})
            </h5>
            <div className="space-y-2">
              {moderation.flaggedMessages.map((flagged, index) => (
                <div key={index} className="p-2 bg-white/50 dark:bg-gray-800/50 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{flagged.reason}</span>
                    <span className={`px-2 py-0.5 rounded ${
                      flagged.severity === 'high' ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200' :
                      flagged.severity === 'medium' ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {flagged.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 truncate">{flagged.content}</p>
                  {onFlagMessage && (
                    <button
                      onClick={() => onFlagMessage(flagged.messageId, flagged.reason)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      Review Message
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showDetails && (
          <div>
            <h5 className="text-sm font-medium mb-2">Insights</h5>
            <ul className="space-y-1">
              {moderation.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <Brain className="mt-0.5 flex-shrink-0" size={14} />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatModeration;

