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
  Clock,
  Video,
  Phone,
  MoreVertical,
  Search,
  Image as ImageGallery,
  Folder,
  Users,
  Info,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Brain,
  Languages,
  FileDown,
  Reply,
  Forward,
  Copy,
  Edit,
  Heart,
  Image,
  Sticker,
  MessageSquare
} from 'lucide-react';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';
import { formatDateTime } from '../../lib/utils';
import { FitnessData } from '../../services/chatAPI';
import EmojiPickerModal from './EmojiPickerModal';
import ReactionPickerModal from './ReactionPickerModal';
import MessageOptionsModal from './MessageOptionsModal';
import SearchInChatModal from './SearchInChatModal';
import MediaGalleryModal from './MediaGalleryModal';
import FileListModal from './FileListModal';
import GroupInfoModal from './GroupInfoModal';
import UserInfoModal from './UserInfoModal';
import AIChatSummaryModal from './AIChatSummaryModal';
import AITranslateModal from './AITranslateModal';
import AIMessageSuggestions from './AIMessageSuggestions';
import AISmartReplies from './AISmartReplies';
import AISentimentAnalysis from './AISentimentAnalysis';
import AIConversationTopics from './AIConversationTopics';
import AIChatModeration from './AIChatModeration';
import AIChatAnalytics from './AIChatAnalytics';
import GIFPickerModal from './GIFPickerModal';
import StickerPickerModal from './StickerPickerModal';
import VoiceRecorderModal from './VoiceRecorderModal';

interface EnhancedChatRoomProps {
  roomId: string;
  onClose?: () => void;
}

const EnhancedChatRoom: React.FC<EnhancedChatRoomProps> = ({ roomId, onClose }) => {
  const { user } = useAuthStore();
  const { 
    rooms, 
    currentRoomId, 
    sendMessage, 
    sendImage, 
    sendFile, 
    shareFitnessData,
    setCurrentRoom,
    typingUsers,
    isConnected
  } = useChatStore();
  
  // Use selector to ensure reactivity when messages change for this specific room
  const roomMessages = useChatStore((state) => state.messages[roomId] || []);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showFileList, setShowFileList] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showAITranslate, setShowAITranslate] = useState(false);
  const [showGIFPicker, setShowGIFPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [reactionPosition, setReactionPosition] = useState<{ x: number; y: number } | undefined>();
  const [messageOptionsPosition, setMessageOptionsPosition] = useState<{ x: number; y: number } | undefined>();
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Set current room when component mounts
  useEffect(() => {
    setCurrentRoom(roomId);
    
    // Load messages for this room if not already loaded
    const { getRoomMessages, messages } = useChatStore.getState();
    if (!messages[roomId] || messages[roomId].length === 0) {
      getRoomMessages(roomId).catch(() => {
        // Silently fail - messages will be loaded from localStorage
      });
    }
  }, [roomId, setCurrentRoom]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, roomId]);

  // Get current room data
  const currentRoom = rooms.find(room => room.id === roomId);
  const typingUsersInRoom = typingUsers[roomId] || new Set();

  const handleSendMessage = () => {
    if (message.trim() && roomId) {
      const messageContent = message.trim();
      // Clear input immediately for better UX
      setMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send message - it will be saved to localStorage automatically
      sendMessage(roomId, messageContent);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

  const handleReact = (msg: any, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setReactionPosition({ x: rect.left, y: rect.top - 60 });
    setSelectedMessage(msg);
    setShowReactionPicker(true);
  };

  const handleMessageOptions = (msg: any, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMessageOptionsPosition({ x: rect.left, y: rect.top });
    setSelectedMessage(msg);
    setShowMessageOptions(true);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleReply = (msg: any) => {
    setMessage(`Replying to ${msg.senderName}: ${msg.content.substring(0, 50)}... `);
  };

  const handleEditMessage = (msg: any) => {
    setEditingMessage(msg.id);
    setMessage(msg.content);
  };

  const handleDeleteMessage = (msgId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      // Delete message logic
      console.log('Delete message:', msgId);
    }
  };

  const renderMessage = (msg: any, index: number) => {
    // Check if message is from current user (handle both user.id and currentUser.id)
    const { currentUser } = useChatStore.getState();
    const isOwn = msg.senderId === user?.id || msg.senderId === currentUser?.id;
    
    return (
      <motion.div
        key={msg.id}
        data-message-id={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      >
        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg relative ${
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
          {editingMessage === msg.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(roomId, message);
                    setEditingMessage(null);
                    setMessage('');
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sendMessage(roomId, message);
                    setEditingMessage(null);
                    setMessage('');
                  }}
                  className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessage('');
                  }}
                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {msg.type === 'text' && (
                <p className="text-sm">{msg.content}</p>
              )}
              
              {msg.type === 'image' && (
                <div className="space-y-2">
                  <img 
                    src={msg.fileUrl} 
                    alt="Shared image" 
                    className="max-w-full rounded-lg cursor-pointer"
                    onClick={() => setShowMediaGallery(true)}
                  />
                  {msg.content && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{msg.content}</p>
                  )}
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
              
              <div className="flex items-center justify-between mt-1">
                <p className={`text-xs ${
                  isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatDateTime(msg.timestamp)}
                </p>
                
                {/* Message Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleReact(msg, e)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="React"
                  >
                    <Heart className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleReply(msg)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Reply"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      // Forward functionality
                      alert('Forward message feature would be implemented here');
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Forward"
                  >
                    <Forward className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleCopyMessage(msg.content)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {isOwn && (
                    <button
                      onClick={() => handleEditMessage(msg)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleMessageOptions(msg, e)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="More options"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-3 flex-1">
          <img
            src={currentRoom.avatar}
            alt={currentRoom.name}
            className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 dark:border-gray-700 hover:border-sky-500 transition-colors"
            onClick={() => {
              if (currentRoom.type === 'group') {
                setShowGroupInfo(true);
              } else {
                setShowUserInfo(true);
              }
            }}
          />
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white">{currentRoom.name}</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchInChat(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Search in chat"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowMediaGallery(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="View media"
          >
            <ImageGallery className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowFileList(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="View files"
          >
            <Folder className="w-5 h-5" />
          </button>
          {currentRoom.type === 'group' ? (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Group info"
            >
              <Users className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowUserInfo(true)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="User info"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMuted(!muted)}
            className={`p-2.5 rounded-lg transition-colors ${
              muted 
                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={muted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {muted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowAISummary(true)}
            className="p-2.5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 dark:hover:from-indigo-900/20 dark:hover:to-violet-900/20 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400"
            title="AI Summarize"
          >
            <Brain className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowAITranslate(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="AI Translate"
          >
            <Languages className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              // Video call functionality
              alert('Video call feature would be implemented here');
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              // Voice call functionality
              alert('Voice call feature would be implemented here');
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 space-y-4">
        {roomMessages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          <>
            {/* AI Components for conversation analysis */}
            {roomMessages.length > 10 && (
              <div className="mb-4 space-y-3">
                <AISentimentAnalysis messages={roomMessages} showDetails={false} />
                <AIConversationTopics 
                  messages={roomMessages}
                  onSelectTopic={(topic) => {
                    setShowSearchInChat(true);
                  }}
                />
                <AIChatModeration messages={roomMessages} />
                <AIChatAnalytics 
                  messages={roomMessages}
                  participants={currentRoom.participants}
                />
              </div>
            )}
            
            {roomMessages.map((msg, index) => renderMessage(msg, index))}
          </>
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

      {/* AI Message Suggestions */}
      {roomMessages.length > 0 && (
        <AIMessageSuggestions
          conversationContext={roomMessages.map(m => m.content)}
          onSelectSuggestion={(suggestion) => {
            setMessage(suggestion);
          }}
        />
      )}

      {/* AI Smart Replies */}
      {roomMessages.length > 0 && (
        <AISmartReplies
          lastMessage={roomMessages[roomMessages.length - 1]}
          onSelectReply={(reply) => {
            setMessage(reply);
          }}
        />
      )}

      {/* Message Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          {/* File attachment */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Image attachment */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          
          {/* Voice message */}
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Voice message"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          {/* Emoji */}
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {/* GIF */}
          <button
            onClick={() => setShowGIFPicker(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="GIF"
          >
            <Image className="w-5 h-5" />
          </button>
          
          {/* Sticker */}
          <button
            onClick={() => setShowStickerPicker(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="Sticker"
          >
            <Sticker className="w-5 h-5" />
          </button>
          
          {/* More options */}
          <button
            onClick={() => {
              // More options menu
              alert('More options feature would be implemented here');
            }}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Message input */}
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          
          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              sendImage(roomId, file);
            }
          }}
          className="hidden"
        />
      </div>

      {/* Modals */}
      <EmojiPickerModal
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={(emoji) => {
          setMessage(prev => prev + emoji);
          setShowEmojiPicker(false);
        }}
      />

      <ReactionPickerModal
        isOpen={showReactionPicker}
        onClose={() => {
          setShowReactionPicker(false);
          setSelectedMessage(null);
        }}
        onSelectReaction={(emoji) => {
          console.log('Reacted with:', emoji, 'to message:', selectedMessage?.id);
          setShowReactionPicker(false);
        }}
        position={reactionPosition}
      />

      <MessageOptionsModal
        isOpen={showMessageOptions}
        onClose={() => {
          setShowMessageOptions(false);
          setSelectedMessage(null);
        }}
        onReply={() => {
          if (selectedMessage) handleReply(selectedMessage);
        }}
        onForward={() => {
          alert('Forward message feature would be implemented here');
        }}
        onCopy={() => {
          if (selectedMessage) handleCopyMessage(selectedMessage.content);
        }}
        onDelete={() => {
          if (selectedMessage) handleDeleteMessage(selectedMessage.id);
        }}
        onEdit={() => {
          if (selectedMessage) handleEditMessage(selectedMessage);
        }}
        isOwnMessage={selectedMessage?.senderId === user?.id}
        position={messageOptionsPosition}
      />

      <SearchInChatModal
        isOpen={showSearchInChat}
        onClose={() => setShowSearchInChat(false)}
        messages={roomMessages}
        onSelectMessage={(messageId) => {
          // Scroll to message
          setTimeout(() => {
            const element = document.querySelector(`[data-message-id="${messageId}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Highlight the message
              element.classList.add('ring-2', 'ring-blue-500');
              setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blue-500');
              }, 2000);
            }
          }, 100);
        }}
      />

      <MediaGalleryModal
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        messages={roomMessages}
      />

      <FileListModal
        isOpen={showFileList}
        onClose={() => setShowFileList(false)}
        messages={roomMessages}
      />

      {currentRoom.type === 'group' ? (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          group={currentRoom}
          currentUserId={user?.id || ''}
          onUpdateGroup={(updates) => {
            console.log('Update group:', updates);
          }}
          onLeaveGroup={() => {
            alert('Leave group functionality would be implemented here');
          }}
          onDeleteGroup={() => {
            if (window.confirm('Are you sure you want to delete this group?')) {
              alert('Delete group functionality would be implemented here');
            }
          }}
          onAddMember={() => {
            alert('Add member functionality would be implemented here');
          }}
          onRemoveMember={(userId) => {
            alert(`Remove member ${userId} functionality would be implemented here`);
          }}
        />
      ) : (
        <UserInfoModal
          isOpen={showUserInfo}
          onClose={() => setShowUserInfo(false)}
          user={{
            id: currentRoom.participants.find(p => p !== user?.id) || '',
            name: currentRoom.name,
            avatar: currentRoom.avatar,
            isOnline: currentRoom.isOnline
          }}
          onMessage={() => {
            // Already in chat
          }}
          onCall={() => {
            alert('Voice call functionality would be implemented here');
          }}
          onVideoCall={() => {
            alert('Video call functionality would be implemented here');
          }}
        />
      )}

      <AIChatSummaryModal
        isOpen={showAISummary}
        onClose={() => setShowAISummary(false)}
        messages={roomMessages}
      />

      <AITranslateModal
        isOpen={showAITranslate}
        onClose={() => setShowAITranslate(false)}
        text={selectedMessage?.content || roomMessages[roomMessages.length - 1]?.content || ''}
      />

      <GIFPickerModal
        isOpen={showGIFPicker}
        onClose={() => setShowGIFPicker(false)}
        onSelectGIF={(gifUrl) => {
          // Send GIF as image message
          console.log('Selected GIF:', gifUrl);
          // In real app, convert GIF URL to file and send
        }}
      />

      <StickerPickerModal
        isOpen={showStickerPicker}
        onClose={() => setShowStickerPicker(false)}
        onSelectSticker={(stickerUrl) => {
          // Send sticker as image message
          console.log('Selected sticker:', stickerUrl);
          // In real app, convert sticker URL to file and send
        }}
      />

      <VoiceRecorderModal
        isOpen={showVoiceRecorder}
        onClose={() => setShowVoiceRecorder(false)}
        onSendRecording={(audioBlob, duration) => {
          // Send voice message
          console.log('Sending voice message:', audioBlob, duration);
          // In real app, upload audio blob and send as voice message
        }}
      />
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
