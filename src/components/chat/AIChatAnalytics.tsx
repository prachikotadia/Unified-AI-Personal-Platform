import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, BarChart3, TrendingUp, MessageSquare, Users, Clock, Activity } from 'lucide-react';
import { Message } from '../../store/chat';

interface AIChatAnalyticsProps {
  messages: Message[];
  participants: string[];
  showCharts?: boolean;
}

interface AnalyticsData {
  totalMessages: number;
  messagesPerParticipant: Record<string, number>;
  averageResponseTime: number;
  peakHours: Array<{ hour: number; count: number }>;
  messageTypes: Record<string, number>;
  conversationLength: number;
  insights: string[];
}

const AIChatAnalytics: React.FC<AIChatAnalyticsProps> = ({
  messages,
  participants,
  showCharts = false
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      generateAnalytics();
    }
  }, [messages, participants]);

  const generateAnalytics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI-powered chat analytics
    const messagesPerParticipant: Record<string, number> = {};
    participants.forEach(p => {
      messagesPerParticipant[p] = messages.filter(m => m.senderId === p).length;
    });

    const messageTypes: Record<string, number> = {};
    messages.forEach(m => {
      messageTypes[m.type] = (messageTypes[m.type] || 0) + 1;
    });

    const peakHours: Array<{ hour: number; count: number }> = [];
    for (let i = 0; i < 24; i++) {
      peakHours.push({
        hour: i,
        count: messages.filter(m => new Date(m.timestamp).getHours() === i).length
      });
    }
    peakHours.sort((a, b) => b.count - a.count);

    const mockAnalytics: AnalyticsData = {
      totalMessages: messages.length,
      messagesPerParticipant,
      averageResponseTime: 2.5, // minutes
      peakHours: peakHours.slice(0, 5),
      messageTypes,
      conversationLength: messages.length > 0
        ? Math.round((new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime()) / (1000 * 60 * 60))
        : 0,
      insights: [
        `Most active participant: ${Object.entries(messagesPerParticipant).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}`,
        `Peak conversation time: ${peakHours[0]?.hour || 0}:00`,
        `Average response time: 2.5 minutes`,
        `Most common message type: ${Object.entries(messageTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'text'}`
      ]
    };

    setAnalytics(mockAnalytics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Generating analytics...</span>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-blue-600" size={18} />
        <h4 className="font-semibold">Chat Analytics</h4>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
          AI
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <MessageSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.totalMessages}</div>
          <div className="text-xs text-gray-500">Messages</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{participants.length}</div>
          <div className="text-xs text-gray-500">Participants</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.averageResponseTime}m</div>
          <div className="text-xs text-gray-500">Avg Response</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Activity className="w-5 h-5 text-orange-600 mx-auto mb-1" />
          <div className="text-xl font-bold">{analytics.conversationLength}h</div>
          <div className="text-xs text-gray-500">Duration</div>
        </div>
      </div>

      {/* Participant Activity */}
      <div className="mb-4">
        <h5 className="text-sm font-medium mb-2">Message Distribution</h5>
        <div className="space-y-2">
          {Object.entries(analytics.messagesPerParticipant)
            .sort((a, b) => b[1] - a[1])
            .map(([participant, count]) => (
              <div key={participant} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / analytics.totalMessages) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-right">
                  {participant.slice(-4)}: {count}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Insights */}
      <div>
        <h5 className="text-sm font-medium mb-2">AI Insights</h5>
        <ul className="space-y-1">
          {analytics.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <TrendingUp className="mt-0.5 flex-shrink-0" size={14} />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIChatAnalytics;

