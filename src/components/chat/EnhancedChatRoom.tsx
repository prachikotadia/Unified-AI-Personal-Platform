import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon,
  FileText,
  Activity,
  Smile,
  Mic,
  Download,
  X,
  User,
  Clock
} from 'lucide-react';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';
import { formatDateTime } from '../../lib/utils';
import { FitnessData } from '../../services/chatAPI';

interface EnhancedChatRoomProps {
  roomId: string;
  onClose?: () => void;
}

const EnhancedChatRoom: React.FC<EnhancedChatRoomProps> = ({ roomId, onClose }) => {
  const { user } = useAuthStore();
  const { 
    rooms, 
    messages, 
    currentRoomId, 
    sendMessage, 
    sendImage, 
    sendFile, 
    shareFitnessData,
    setCurrentRoom,
    typingUsers,
    isConnected
  } = useChatStore();
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Set current room when component mounts
  useEffect(() => {
    setCurrentRoom(roomId);
  }, [roomId, setCurrentRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current room data
  const currentRoom = rooms.find(room => room.id === roomId);
  const roomMessages = messages[roomId] || [];
  const typingUsersInRoom = typingUsers[roomId] || new Set();

  const handleSendMessage = () => {
    if (message.trim() && roomId && user) {
      sendMessage(roomId, message.trim());
      setMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      // Send typing indicator to server
    }
    
    // Clear typing indicator after 2 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowFileInput(true);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      sendImage(roomId, file);
    }
  };

  const handleFileSend = async () => {
    if (selectedFile && roomId) {
      await sendFile(roomId, selectedFile);
      setSelectedFile(null);
      setShowFileInput(false);
    }
  };

  const handleShareFitness = () => {
    setShowFitnessModal(true);
  };

  const handleFitnessDataSubmit = (fitnessData: FitnessData) => {
    shareFitnessData(roomId, fitnessData);
    setShowFitnessModal(false);
  };

  const renderMessage = (msg: any, index: number) => {
    const isOwn = msg.senderId === user?.id;
    
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          {!isOwn && (
            <div className="flex items-center space-x-2 mb-1">
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="w-4 h-4 rounded-full"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{msg.senderName}</p>
            </div>
          )}
          
          {/* Message content based on type */}
          {msg.type === 'text' && (
            <p className="text-sm">{msg.content}</p>
          )}
          
          {msg.type === 'image' && (
            <div className="space-y-2">
              <img 
                src={msg.fileUrl} 
                alt="Shared image" 
                className="max-w-full rounded-lg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{msg.content}</p>
            </div>
          )}
          
          {msg.type === 'file' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <FileText className="w-4 h-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{msg.fileName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((msg.fileSize || 0) / 1024)} KB
                  </p>
                </div>
                <button 
                  onClick={() => window.open(msg.fileUrl, '_blank')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {msg.type === 'fitness_data' && (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Fitness Data Shared
                  </p>
                </div>
                {msg.fitnessData && (
                  <div className="space-y-1 text-xs">
                    {msg.fitnessData.steps && (
                      <p>Steps: {msg.fitnessData.steps.toLocaleString()}</p>
                    )}
                    {msg.fitnessData.calories && (
                      <p>Calories: {msg.fitnessData.calories}</p>
                    )}
                    {msg.fitnessData.distance && (
                      <p>Distance: {msg.fitnessData.distance} km</p>
                    )}
                    {msg.fitnessData.workout_type && (
                      <p>Workout: {msg.fitnessData.workout_type}</p>
                    )}
                    {msg.fitnessData.duration && (
                      <p>Duration: {msg.fitnessData.duration} min</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatDateTime(msg.timestamp)}
          </p>
        </div>
      </motion.div>
    );
  };

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Room not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src={currentRoom.avatar}
            alt={currentRoom.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold">{currentRoom.name}</h2>
            <p className="text-sm text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {roomMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          roomMessages.map((msg, index) => renderMessage(msg, index))
        )}
        
        {/* Typing indicator */}
        {typingUsersInRoom.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-500">
                {Array.from(typingUsersInRoom).join(', ')} is typing...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* File input modal */}
      {showFileInput && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send File</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <FileText className="w-5 h-5" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleFileSend}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setShowFileInput(false);
                  }}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fitness data modal */}
      {showFitnessModal && (
        <FitnessDataModal
          onSubmit={handleFitnessDataSubmit}
          onClose={() => setShowFitnessModal(false)}
        />
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {/* File attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Image attachment */}
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  sendImage(roomId, file);
                }
              };
              input.click();
            }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Send image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {/* Fitness data */}
          <button
            onClick={handleShareFitness}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Share fitness data"
          >
            <Activity className="w-5 h-5" />
          </button>
          
          {/* Message input */}
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

// Fitness Data Modal Component
interface FitnessDataModalProps {
  onSubmit: (data: FitnessData) => void;
  onClose: () => void;
}

const FitnessDataModal: React.FC<FitnessDataModalProps> = ({ onSubmit, onClose }) => {
  const [fitnessData, setFitnessData] = useState<FitnessData>({
    steps: 0,
    calories: 0,
    distance: 0,
    workout_type: '',
    duration: 0,
    heart_rate: 0,
    sleep_hours: 0,
    weight: 0,
    bmi: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(fitnessData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Share Fitness Data</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Steps</label>
              <input
                type="number"
                value={fitnessData.steps}
                onChange={(e) => setFitnessData(prev => ({ ...prev, steps: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Calories</label>
              <input
                type="number"
                value={fitnessData.calories}
                onChange={(e) => setFitnessData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Distance (km)</label>
              <input
                type="number"
                step="0.1"
                value={fitnessData.distance}
                onChange={(e) => setFitnessData(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input
                type="number"
                value={fitnessData.duration}
                onChange={(e) => setFitnessData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Workout Type</label>
            <select
              value={fitnessData.workout_type}
              onChange={(e) => setFitnessData(prev => ({ ...prev, workout_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select workout type</option>
              <option value="Running">Running</option>
              <option value="Walking">Walking</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="Gym">Gym</option>
              <option value="Yoga">Yoga</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Share
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedChatRoom;
