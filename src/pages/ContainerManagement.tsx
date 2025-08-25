import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play,
  Square,
  RotateCcw,
  Eye,
  Download,
  Settings,
  Server,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Container {
  id: string
  name: string
  image: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error'
  ports: string[]
  created: string
  size: string
  cpu: number
  memory: number
  network: number
  logs: string[]
  environment: Record<string, string>
}

interface Pod {
  name: string
  namespace: string
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown'
  ready: string
  restarts: number
  age: string
  ip: string
  node: string
  containers: Container[]
}

const ContainerManagement = () => {
  const [containers, setContainers] = useState<Container[]>([])
  const [pods, setPods] = useState<Pod[]>([])
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [selectedPod, setSelectedPod] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('containers')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockContainers: Container[] = [
      {
        id: 'container-001',
        name: 'omnilife-frontend',
        image: 'ghcr.io/omnilife/frontend:latest',
        status: 'running',
        ports: ['80:80'],
        created: '2 hours ago',
        size: '156MB',
        cpu: 2.5,
        memory: 45,
        network: 12,
        logs: ['Container started', 'Nginx running', 'Health check passed'],
        environment: {
          NODE_ENV: 'production',
          VITE_API_URL: 'https://api.omnilife.com'
        }
      },
      {
        id: 'container-002',
        name: 'omnilife-backend',
        image: 'ghcr.io/omnilife/backend:latest',
        status: 'running',
        ports: ['8000:8000'],
        created: '2 hours ago',
        size: '234MB',
        cpu: 15.2,
        memory: 78,
        network: 45,
        logs: ['FastAPI started', 'Database connected', 'Redis connected'],
        environment: {
          ENVIRONMENT: 'production',
          DATABASE_URL: 'postgresql://...'
        }
      },
      {
        id: 'container-003',
        name: 'omnilife-postgres',
        image: 'postgres:15-alpine',
        status: 'running',
        ports: ['5432:5432'],
        created: '3 hours ago',
        size: '89MB',
        cpu: 8.1,
        memory: 156,
        network: 3,
        logs: ['PostgreSQL started', 'Database ready'],
        environment: {
          POSTGRES_DB: 'omnilife_prod',
          POSTGRES_USER: 'postgres'
        }
      },
      {
        id: 'container-004',
        name: 'omnilife-redis',
        image: 'redis:7-alpine',
        status: 'stopped',
        ports: ['6379:6379'],
        created: '1 day ago',
        size: '45MB',
        cpu: 0,
        memory: 0,
        network: 0,
        logs: ['Redis stopped'],
        environment: {}
      }
    ]

    const mockPods: Pod[] = [
      {
        name: 'omnilife-frontend-abc123',
        namespace: 'omnilife',
        status: 'Running',
        ready: '1/1',
        restarts: 0,
        age: '2h',
        ip: '10.244.0.5',
        node: 'worker-1',
        containers: [mockContainers[0]]
      },
      {
        name: 'omnilife-backend-def456',
        namespace: 'omnilife',
        status: 'Running',
        ready: '1/1',
        restarts: 1,
        age: '2h',
        ip: '10.244.0.6',
        node: 'worker-2',
        containers: [mockContainers[1]]
      }
    ]

    setContainers(mockContainers)
    setPods(mockPods)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
    toast.success('Container status refreshed!')
  }

  const handleContainerAction = async (containerId: string, action: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Container ${action} successful!`)
    } catch (error) {
      toast.error(`Failed to ${action} container`)
    }
  }

  const handlePodAction = async (podName: string, action: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Pod ${action} successful!`)
    } catch (error) {
      toast.error(`Failed to ${action} pod`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'text-green-500'
      case 'stopped':
      case 'failed':
        return 'text-red-500'
      case 'starting':
      case 'pending':
        return 'text-yellow-500'
      case 'stopping':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />
      case 'stopped':
      case 'failed':
        return <XCircle className="w-4 h-4" />
      case 'starting':
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'stopping':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const filteredContainers = containers.filter(container => {
    const matchesSearch = container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.image.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || container.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredPods = pods.filter(pod => {
    const matchesSearch = pod.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || pod.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Container Management
            </h1>
            <p className="text-gray-400 mt-2">Manage Docker containers and Kubernetes pods</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">All Systems Operational</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-sm rounded-xl p-1"
        >
          {[
            { id: 'containers', label: 'Docker Containers', icon: Server },
            { id: 'pods', label: 'Kubernetes Pods', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search containers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
              <option value="starting">Starting</option>
              <option value="stopping">Stopping</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'containers' && (
            <motion.div
              key="containers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
              {filteredContainers.map((container, index) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(container.status)}>
                        {getStatusIcon(container.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                        <p className="text-sm text-gray-400">{container.image}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedContainer(selectedContainer === container.id ? null : container.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {selectedContainer === container.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{container.cpu}%</div>
                      <div className="text-xs text-gray-400">CPU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{container.memory}%</div>
                      <div className="text-xs text-gray-400">Memory</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>Created: {container.created}</span>
                    <span>Size: {container.size}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {container.status === 'running' ? (
                      <>
                        <button
                          onClick={() => handleContainerAction(container.id, 'stop')}
                          className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Square className="w-3 h-3" />
                          Stop
                        </button>
                        <button
                          onClick={() => handleContainerAction(container.id, 'restart')}
                          className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restart
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleContainerAction(container.id, 'start')}
                        className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </button>
                    )}
                    <button
                      onClick={() => handleContainerAction(container.id, 'logs')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Logs
                    </button>
                  </div>

                  <AnimatePresence>
                    {selectedContainer === container.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <div className="text-sm text-gray-300 mb-2">Recent Logs:</div>
                        <div className="bg-black/50 rounded-lg p-3 font-mono text-xs max-h-32 overflow-y-auto">
                          {container.logs.map((log, logIndex) => (
                            <div key={logIndex} className="text-gray-400">
                              {log}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'pods' && (
            <motion.div
              key="pods"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {filteredPods.map((pod, index) => (
                <motion.div
                  key={pod.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={getStatusColor(pod.status)}>
                        {getStatusIcon(pod.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{pod.name}</h3>
                        <p className="text-sm text-gray-400">Namespace: {pod.namespace}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPod(selectedPod === pod.name ? null : pod.name)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {selectedPod === pod.name ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{pod.status}</div>
                      <div className="text-xs text-gray-400">Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{pod.ready}</div>
                      <div className="text-xs text-gray-400">Ready</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{pod.restarts}</div>
                      <div className="text-xs text-gray-400">Restarts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{pod.age}</div>
                      <div className="text-xs text-gray-400">Age</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span>IP: {pod.ip}</span>
                    <span>Node: {pod.node}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePodAction(pod.name, 'delete')}
                      className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <button
                      onClick={() => handlePodAction(pod.name, 'logs')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Logs
                    </button>
                    <button
                      onClick={() => handlePodAction(pod.name, 'describe')}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors"
                    >
                      <Settings className="w-3 h-3" />
                      Describe
                    </button>
                  </div>

                  <AnimatePresence>
                    {selectedPod === pod.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        <div className="text-sm text-gray-300 mb-2">Containers:</div>
                        <div className="space-y-2">
                          {pod.containers.map((container, containerIndex) => (
                            <div key={containerIndex} className="bg-black/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{container.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  container.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {container.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Image: {container.image}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ContainerManagement
