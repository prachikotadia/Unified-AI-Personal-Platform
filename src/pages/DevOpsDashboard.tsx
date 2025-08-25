import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Play,
  RotateCcw,
  GitBranch,
  GitCommit,
  Users,
  Server,
  Database,
  Shield,
  Bell,
  Settings,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BuildStatus {
  id: string
  status: 'success' | 'failed' | 'running' | 'pending'
  branch: string
  commit: string
  author: string
  duration: number
  timestamp: string
  logs: string[]
}

interface DeploymentStatus {
  id: string
  environment: 'staging' | 'production'
  status: 'deployed' | 'failed' | 'deploying' | 'rolled-back'
  version: string
  timestamp: string
  duration: number
  health: 'healthy' | 'unhealthy' | 'degraded'
}

interface Metrics {
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  errorRate: number
  throughput: number
}

const DevOpsDashboard = () => {
  const [builds, setBuilds] = useState<BuildStatus[]>([])
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 45,
    memory: 62,
    disk: 28,
    network: 78,
    responseTime: 245,
    errorRate: 0.2,
    throughput: 1250
  })
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null)
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockBuilds: BuildStatus[] = [
      {
        id: 'build-001',
        status: 'success',
        branch: 'main',
        commit: 'a1b2c3d',
        author: 'John Doe',
        duration: 245,
        timestamp: '2024-12-15T10:30:00Z',
        logs: ['Build started', 'Tests passed', 'Deployment successful']
      },
      {
        id: 'build-002',
        status: 'failed',
        branch: 'dev',
        commit: 'e4f5g6h',
        author: 'Jane Smith',
        duration: 180,
        timestamp: '2024-12-15T09:15:00Z',
        logs: ['Build started', 'Tests failed', 'Deployment cancelled']
      },
      {
        id: 'build-003',
        status: 'running',
        branch: 'feature/auth',
        commit: 'i7j8k9l',
        author: 'Bob Johnson',
        duration: 120,
        timestamp: '2024-12-15T11:00:00Z',
        logs: ['Build started', 'Running tests...']
      }
    ]

    const mockDeployments: DeploymentStatus[] = [
      {
        id: 'deploy-001',
        environment: 'production',
        status: 'deployed',
        version: 'v1.2.3',
        timestamp: '2024-12-15T10:35:00Z',
        duration: 180,
        health: 'healthy'
      },
      {
        id: 'deploy-002',
        environment: 'staging',
        status: 'deployed',
        version: 'v1.2.3-rc1',
        timestamp: '2024-12-15T09:20:00Z',
        duration: 150,
        health: 'healthy'
      }
    ]

    setBuilds(mockBuilds)
    setDeployments(mockDeployments)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
    toast.success('Dashboard refreshed!')
  }

  const handleRollback = async (deploymentId: string) => {
    try {
      // Simulate rollback API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.success('Rollback initiated successfully!')
    } catch (error) {
      toast.error('Rollback failed!')
    }
  }

  const handleRedeploy = async (deploymentId: string) => {
    try {
      // Simulate redeploy API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Redeployment initiated!')
    } catch (error) {
      toast.error('Redeployment failed!')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'deployed':
      case 'healthy':
        return 'text-green-500'
      case 'failed':
      case 'unhealthy':
        return 'text-red-500'
      case 'running':
      case 'deploying':
        return 'text-blue-500'
      case 'pending':
        return 'text-yellow-500'
      case 'degraded':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'deployed':
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />
      case 'failed':
      case 'unhealthy':
        return <XCircle className="w-5 h-5" />
      case 'running':
      case 'deploying':
        return <RefreshCw className="w-5 h-5 animate-spin" />
      case 'pending':
        return <Clock className="w-5 h-5" />
      default:
        return <Activity className="w-5 h-5" />
    }
  }

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
              DevOps Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Real-time monitoring and deployment management</p>
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
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'builds', label: 'Builds', icon: GitCommit },
            { id: 'deployments', label: 'Deployments', icon: Server },
            { id: 'monitoring', label: 'Monitoring', icon: Shield },
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

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Metrics Cards */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'CPU Usage', value: `${metrics.cpu}%`, icon: Activity, color: 'text-blue-400' },
                  { label: 'Memory', value: `${metrics.memory}%`, icon: Database, color: 'text-green-400' },
                  { label: 'Response Time', value: `${metrics.responseTime}ms`, icon: Clock, color: 'text-yellow-400' },
                  { label: 'Error Rate', value: `${metrics.errorRate}%`, icon: XCircle, color: 'text-red-400' },
                ].map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                    <div className="text-sm text-gray-400">{metric.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {builds.slice(0, 3).map((build, index) => (
                    <motion.div
                      key={build.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className={getStatusColor(build.status)}>
                        {getStatusIcon(build.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {build.branch} • {build.commit.slice(0, 7)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(build.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'builds' && (
            <motion.div
              key="builds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Build History</h3>
                <div className="space-y-4">
                  {builds.map((build, index) => (
                    <motion.div
                      key={build.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={getStatusColor(build.status)}>
                            {getStatusIcon(build.status)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              Build #{build.id.split('-')[1]}
                            </div>
                            <div className="text-xs text-gray-400">
                              {build.branch} • {build.commit.slice(0, 7)} • {build.author}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {build.duration}s
                          </span>
                          <button
                            onClick={() => setSelectedBuild(selectedBuild === build.id ? null : build.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {selectedBuild === build.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {selectedBuild === build.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/10"
                          >
                            <div className="text-sm text-gray-300 mb-2">Build Logs:</div>
                            <div className="bg-black/50 rounded-lg p-3 font-mono text-xs">
                              {build.logs.map((log, logIndex) => (
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
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'deployments' && (
            <motion.div
              key="deployments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Deployments</h3>
                <div className="space-y-4">
                  {deployments.map((deployment, index) => (
                    <motion.div
                      key={deployment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-sm bg-white/5 rounded-xl border border-white/10 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={getStatusColor(deployment.status)}>
                            {getStatusIcon(deployment.status)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {deployment.environment.charAt(0).toUpperCase() + deployment.environment.slice(1)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {deployment.version} • {new Date(deployment.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            deployment.health === 'healthy' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {deployment.health}
                          </span>
                          <button
                            onClick={() => setSelectedDeployment(selectedDeployment === deployment.id ? null : deployment.id)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {selectedDeployment === deployment.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {selectedDeployment === deployment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/10"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRedeploy(deployment.id)}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                              >
                                <Play className="w-3 h-3" />
                                Redeploy
                              </button>
                              <button
                                onClick={() => handleRollback(deployment.id)}
                                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Rollback
                              </button>
                              <button className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30 transition-colors">
                                <Download className="w-3 h-3" />
                                Download Logs
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'monitoring' && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* System Metrics */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">System Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: metrics.cpu, color: 'bg-blue-500' },
                    { label: 'Memory Usage', value: metrics.memory, color: 'bg-green-500' },
                    { label: 'Disk Usage', value: metrics.disk, color: 'bg-yellow-500' },
                    { label: 'Network I/O', value: metrics.network, color: 'bg-purple-500' },
                  ].map((metric, index) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{metric.label}</span>
                        <span className="text-white">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ delay: index * 0.1, duration: 1 }}
                          className={`h-2 rounded-full ${metric.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Metrics */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Application Metrics</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics.responseTime}ms</div>
                      <div className="text-sm text-gray-400">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics.errorRate}%</div>
                      <div className="text-sm text-gray-400">Error Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics.throughput}</div>
                      <div className="text-sm text-gray-400">Requests/sec</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">99.9%</div>
                      <div className="text-sm text-gray-400">Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DevOpsDashboard
