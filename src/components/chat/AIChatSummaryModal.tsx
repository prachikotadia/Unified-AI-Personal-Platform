import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Sparkles, Download, Copy, CheckCircle } from 'lucide-react';
import { Message } from '../../store/chat';

interface AIChatSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onCopySummary?: (summary: string) => void;
}

const AIChatSummaryModal: React.FC<AIChatSummaryModalProps> = ({
  isOpen,
  onClose,
  messages,
  onCopySummary
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      generateSummary();
    }
  }, [isOpen, messages]);

  const generateSummary = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI-powered chat summarization
    const mockSummary = {
      overview: 'This conversation covered multiple topics including project planning, team coordination, and upcoming deadlines.',
      keyPoints: [
        'Discussed project timeline and milestones',
        'Coordinated team meeting schedules',
        'Reviewed progress on current tasks',
        'Planned next steps for the project'
      ],
      participants: Array.from(new Set(messages.map(m => m.senderName))),
      messageCount: messages.length,
      timeSpan: messages.length > 0 
        ? `${Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()) / (1000 * 60 * 60))} hours`
        : 'N/A',
      sentiment: 'positive',
      actionItems: [
        'Schedule follow-up meeting',
        'Review project documentation',
        'Update team on progress'
      ],
      topics: ['Project Management', 'Team Coordination', 'Planning']
    };

    setSummary(mockSummary);
    setLoading(false);
  };

  const handleCopy = () => {
    if (summary) {
      const summaryText = `Chat Summary\n\n${summary.overview}\n\nKey Points:\n${summary.keyPoints.map((p: string) => `• ${p}`).join('\n')}`;
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      if (onCopySummary) {
        onCopySummary(summaryText);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Chat Summary</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">AI is analyzing the conversation...</p>
          </div>
        ) : summary && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Overview</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{summary.overview}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold">{summary.messageCount}</div>
                <div className="text-xs text-gray-500">Messages</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold">{summary.participants.length}</div>
                <div className="text-xs text-gray-500">Participants</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold">{summary.timeSpan}</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="font-semibold mb-3">Key Points</h3>
              <ul className="space-y-2">
                {summary.keyPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Sparkles className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            {summary.actionItems && summary.actionItems.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Action Items</h3>
                <ul className="space-y-2">
                  {summary.actionItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics */}
            <div>
              <h3 className="font-semibold mb-3">Topics Discussed</h3>
              <div className="flex flex-wrap gap-2">
                {summary.topics.map((topic: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Summary
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AIChatSummaryModal;

