import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Brain, 
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Play,
  Search,
  Bell
} from 'lucide-react'
import { useAIStore } from '../../store/ai'
import { useNotifications } from '../../contexts/NotificationContext'

interface AIAssistantProps {
  module: 'finance' | 'marketplace' | 'fitness' | 'travel' | 'social' | 'chat'
  context?: any
  className?: string
}

const AIAssistant = ({ module, context, className = '' }: AIAssistantProps) => {
  const { 
    conversations, 
    addConversation, 
    updateConversation, 
    isLoading,
    findUser,
    searchProducts,
    createBudget,
    createWorkoutPlan,
    planTrip,
    sendMessage,
    createSocialPost,
    setReminder,
    executeAction
  } = useAIStore()
  const { addNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get module-specific conversation
  const moduleConversation = conversations.find(conv => conv.module === module)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [moduleConversation?.messages])

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = { 
      id: `msg_${Date.now()}_${Math.random()}`,
      role: 'user' as const, 
      content: message.trim(),
      timestamp: new Date()
    }
    
    if (!moduleConversation) {
      // Create new conversation
      const newConversation = {
        module,
        messages: [userMessage],
        context: { ...context, module }
      }
      addConversation(newConversation)
      setCurrentConversation(`conv_${Date.now()}`)
    } else {
      // Update existing conversation
      updateConversation(moduleConversation.id, userMessage)
      setCurrentConversation(moduleConversation.id)
    }

    setMessage('')

    // Simulate AI response with actions
    setTimeout(() => {
      const aiResponse = generateAIResponse(message.trim(), module)
      if (moduleConversation) {
        updateConversation(moduleConversation.id, {
          role: 'assistant',
          content: aiResponse.content,
          actions: aiResponse.actions
        })
      }
    }, 1000)
  }

  const handleActionClick = async (action: any) => {
    try {
      switch (action.type) {
        case 'message':
          setShowUserSearch(true)
          break
        case 'product_search':
          const products = searchProducts(action.data.query || '')
          addNotification({
            type: 'success',
            title: 'Products Found',
            message: `Found ${products.length} products matching "${action.data.query}"`,
            duration: 5000
          })
          break
        case 'budget_create':
          const budget = createBudget(action.data)
          addNotification({
            type: 'success',
            title: 'Budget Created',
            message: `Created ${action.data.category} budget for $${action.data.amount}`,
            duration: 5000
          })
          break
        case 'workout_plan':
          const workout = createWorkoutPlan(action.data)
          addNotification({
            type: 'success',
            title: 'Workout Plan Created',
            message: `Created ${action.data.type} workout plan for ${action.data.duration}`,
            duration: 5000
          })
          break
        case 'trip_plan':
          const trip = planTrip(action.data)
          addNotification({
            type: 'success',
            title: 'Trip Planned',
            message: `Planned trip to ${action.data.destination} for ${action.data.duration}`,
            duration: 5000
          })
          break
        case 'social_post':
          const post = createSocialPost(action.data)
          addNotification({
            type: 'success',
            title: 'Post Created',
            message: 'Social post created successfully',
            duration: 5000
          })
          break
        case 'reminder':
          const reminder = setReminder(action.data)
          addNotification({
            type: 'success',
            title: 'Reminder Set',
            message: `Reminder set for ${action.data.title}`,
            duration: 5000
          })
          break
      }
      
      if (action.id) {
        executeAction(action.id)
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Failed to execute action. Please try again.',
        duration: 5000
      })
    }
  }

  const handleSendMessageToUser = (userId: string, message: string) => {
    sendMessage(userId, message)
    setShowUserSearch(false)
    setSelectedUser(null)
    addNotification({
      type: 'success',
      title: 'Message Sent',
      message: 'Message sent successfully',
      duration: 3000
    })
  }

  const generateAIResponse = (userMessage: string, module: string): { content: string; actions?: any[] } => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for specific action requests
    if (lowerMessage.includes('send message') || lowerMessage.includes('message')) {
      const userMatch = lowerMessage.match(/to\s+(\w+)/i)
      if (userMatch) {
        const userName = userMatch[1]
        const users = findUser(userName)
        if (users.length > 0) {
          return {
            content: `I found ${users[0].name}. What would you like to send them?`,
            actions: [{
              id: `msg_${Date.now()}`,
              type: 'message',
              title: 'Send Message',
              description: `Send message to ${users[0].name}`,
              data: { userId: users[0].id, userName: users[0].name },
              executed: false,
              timestamp: new Date()
            }]
          }
        }
      }
      return {
        content: 'Who would you like to send a message to? I can help you find them.',
        actions: [{
          id: `msg_search_${Date.now()}`,
          type: 'message',
          title: 'Find User',
          description: 'Search for a user to message',
          data: { search: true },
          executed: false,
          timestamp: new Date()
        }]
      }
    }

    if (lowerMessage.includes('find product') || lowerMessage.includes('search product')) {
      const productMatch = lowerMessage.match(/find\s+(.+)/i) || lowerMessage.match(/search\s+(.+)/i)
      if (productMatch) {
        const query = productMatch[1]
        return {
          content: `I'll search for "${query}" in our marketplace. Here are the results:`,
          actions: [{
            id: `search_${Date.now()}`,
            type: 'product_search',
            title: 'Search Products',
            description: `Search for ${query}`,
            data: { query },
            executed: false,
            timestamp: new Date()
          }]
        }
      }
    }

    if (lowerMessage.includes('create budget') || lowerMessage.includes('make budget')) {
      const budgetMatch = lowerMessage.match(/(\d+)\s*(dollars?|dollars?|usd)/i)
      const amount = budgetMatch ? parseInt(budgetMatch[1]) : 500
      
      return {
        content: `I'll create a budget for you. How much would you like to budget? I can suggest $${amount} based on your spending patterns.`,
        actions: [{
          id: `budget_${Date.now()}`,
          type: 'budget_create',
          title: 'Create Budget',
          description: `Create a budget of $${amount}`,
          data: { category: 'general', amount, period: 'monthly' },
          executed: false,
          timestamp: new Date()
        }]
      }
    }

    if (lowerMessage.includes('workout plan') || lowerMessage.includes('exercise plan')) {
      return {
        content: 'I can create a personalized workout plan for you. What type of workout are you interested in?',
        actions: [
          {
            id: `workout_strength_${Date.now()}`,
            type: 'workout_plan',
            title: 'Strength Training',
            description: 'Create strength training plan',
            data: { type: 'strength', duration: '4 weeks', focus: 'muscle building' },
            executed: false,
            timestamp: new Date()
          },
          {
            id: `workout_cardio_${Date.now()}`,
            type: 'workout_plan',
            title: 'Cardio Plan',
            description: 'Create cardio workout plan',
            data: { type: 'cardio', duration: '4 weeks', focus: 'endurance' },
            executed: false,
            timestamp: new Date()
          }
        ]
      }
    }

    if (lowerMessage.includes('plan trip') || lowerMessage.includes('travel plan')) {
      return {
        content: 'I can help you plan a trip! Where would you like to go?',
        actions: [{
          id: `trip_${Date.now()}`,
          type: 'trip_plan',
          title: 'Plan Trip',
          description: 'Create travel itinerary',
          data: { destination: 'TBD', duration: '1 week', budget: 1000 },
          executed: false,
          timestamp: new Date()
        }]
      }
    }

    // Default responses for each module
    const responses = {
      finance: {
        'save money': 'Based on your spending patterns, I recommend: 1) Reduce dining out by 30% (save $150), 2) Cancel unused subscriptions (save $45), 3) Use public transport instead of rideshares (save $80). Total potential savings: $275/month. Would you like me to create a budget plan for you?',
        'budget': 'Here\'s a smart budget breakdown: 50% for needs (rent, utilities, food), 30% for wants (entertainment, shopping), 20% for savings and debt repayment. Would you like me to create a personalized budget plan?',
        'invest': 'Great question! For beginners, I recommend: 1) Start with a 401(k) if available, 2) Consider a Roth IRA for tax-free growth, 3) Diversify with index funds. Your risk tolerance suggests a 70/30 stock/bond allocation.',
        default: 'I can help you with budgeting, saving strategies, investment advice, and financial planning. What specific area would you like to focus on?'
      },
      fitness: {
        'workout': 'Based on your fitness level, here\'s a recommended workout: 1) 10 min warm-up, 2) 20 min cardio (running/cycling), 3) 15 min strength training, 4) 5 min cool-down. Aim for 3-4 sessions per week.',
        'diet': 'For optimal results, focus on: 1) Protein (1.6g per kg body weight), 2) Complex carbs for energy, 3) Healthy fats, 4) Stay hydrated (8-10 glasses/day). Would you like a personalized meal plan?',
        'weight loss': 'To lose 1-2 lbs per week safely: 1) Create a 500-calorie daily deficit, 2) Combine cardio and strength training, 3) Prioritize protein and fiber, 4) Get 7-9 hours of sleep. Track your progress!',
        default: 'I can help with workout plans, nutrition advice, goal setting, and tracking progress. What\'s your main fitness goal?'
      },
      marketplace: {
        'recommend': 'Based on your browsing history, I recommend: 1) Wireless headphones (great reviews, on sale), 2) Smart fitness watch (matches your lifestyle), 3) Ergonomic laptop stand (improves productivity).',
        'price': 'I\'m tracking prices for you! The wireless headphones are currently 15% off, and smart watch prices are expected to drop 10% in the next 2 weeks. Should I set up price alerts?',
        'compare': 'Here\'s a comparison of your viewed items: Headphones: Best sound quality, Smart watch: Best fitness features, Laptop stand: Best ergonomics. Which features matter most to you?',
        default: 'I can help with product recommendations, price tracking, comparisons, and finding the best deals. What are you looking for?'
      },
      travel: {
        'destination': 'Based on your preferences, I recommend: 1) Mountain hiking trip (perfect weather, 3 hours away), 2) Beach weekend (relaxing, good for fitness), 3) City break (cultural activities, good food).',
        'budget': 'For your travel budget, consider: 1) Book flights 2-3 months in advance, 2) Use price alerts for hotels, 3) Consider alternative accommodations, 4) Plan meals to save on dining.',
        'plan': 'I can help plan your trip! Let me know: 1) Your destination, 2) Travel dates, 3) Budget range, 4) Preferred activities. I\'ll create a personalized itinerary.',
        default: 'I can help with destination recommendations, travel planning, budget optimization, and finding the best deals. Where would you like to go?'
      },
      social: {
        'connect': 'Great ways to connect: 1) Share your fitness achievements, 2) Post about your travel plans, 3) Ask for product recommendations, 4) Join group challenges. What interests you most?',
        'share': 'Perfect content to share: 1) Your workout progress, 2) Money-saving tips, 3) Travel photos, 4) Product reviews. Your network would love to see your journey!',
        'engage': 'To increase engagement: 1) Post consistently (2-3 times per week), 2) Use relevant hashtags, 3) Respond to comments, 4) Share valuable insights. Want help with content ideas?',
        default: 'I can help you connect with others, share meaningful content, and build your social presence. What would you like to focus on?'
      },
      chat: {
        'conversation': 'I can help improve your conversations: 1) Ask open-ended questions, 2) Show genuine interest, 3) Share relevant experiences, 4) Use active listening techniques.',
        'group': 'For group chats: 1) Set clear topics, 2) Encourage participation, 3) Moderate respectfully, 4) Share resources. Would you like help organizing a group discussion?',
        'relationship': 'Building relationships takes time. Focus on: 1) Regular check-ins, 2) Meaningful conversations, 3) Shared activities, 4) Mutual support. What type of relationship are you building?',
        default: 'I can help with conversation starters, relationship building, group dynamics, and communication skills. What aspect would you like to improve?'
      }
    }

    const moduleResponses = responses[module as keyof typeof responses] || responses.finance
    
    for (const [key, response] of Object.entries(moduleResponses)) {
      if (lowerMessage.includes(key)) {
        return { content: response }
      }
    }
    
    return { content: moduleResponses.default }
  }

  const getModuleIcon = () => {
    switch (module) {
      case 'finance': return <TrendingUp className="w-4 h-4" />
      case 'fitness': return <Target className="w-4 h-4" />
      case 'marketplace': return <Zap className="w-4 h-4" />
      case 'travel': return <Sparkles className="w-4 h-4" />
      case 'social': return <Lightbulb className="w-4 h-4" />
      case 'chat': return <Brain className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getModuleColor = () => {
    switch (module) {
      case 'finance': return 'from-green-500 to-emerald-500'
      case 'fitness': return 'from-blue-500 to-cyan-500'
      case 'marketplace': return 'from-purple-500 to-pink-500'
      case 'travel': return 'from-orange-500 to-red-500'
      case 'social': return 'from-indigo-500 to-purple-500'
      case 'chat': return 'from-teal-500 to-blue-500'
      default: return 'from-blue-500 to-purple-500'
    }
  }

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'message': return <MessageCircle className="w-4 h-4" />
      case 'product_search': return <Search className="w-4 h-4" />
      case 'budget_create': return <TrendingUp className="w-4 h-4" />
      case 'workout_plan': return <Target className="w-4 h-4" />
      case 'trip_plan': return <Sparkles className="w-4 h-4" />
      case 'social_post': return <Lightbulb className="w-4 h-4" />
      case 'reminder': return <Bell className="w-4 h-4" />
      default: return <Play className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r ${getModuleColor()} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {getModuleIcon()}
      </motion.button>

      {/* AI Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 100 }}
              className="glass-card w-full max-w-md h-96 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getModuleColor()} rounded-full flex items-center justify-center`}>
                    {getModuleIcon()}
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{module} AI Assistant</h3>
                    <p className="text-xs text-gray-500">Powered by AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {moduleConversation ? (
                  moduleConversation.messages.map((msg) => (
                    <div key={msg.id}>
                      <div
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                              : 'glass-card'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                      
                      {/* AI Actions */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.actions.map((action) => (
                            <motion.button
                              key={action.id}
                              onClick={() => handleActionClick(action)}
                              className="w-full p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm flex items-center space-x-2 hover:from-blue-600 hover:to-purple-600 transition-colors"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {getActionIcon(action.type)}
                              <span>{action.title}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    <Sparkles className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Ask me anything about {module}!</p>
                    <p className="text-xs mt-1">Try: "send message to Sarah", "find product headphones", "create budget"</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Ask about ${module}...`}
                    className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowUserSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Send Message</h3>
              <div className="space-y-2">
                {findUser('').map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user)
                      setShowUserSearch(false)
                      handleSendMessageToUser(user.id, 'Hello! How are you?')
                    }}
                    className="w-full p-3 flex items-center space-x-3 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{user.status}</p>
                    </div>
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant
