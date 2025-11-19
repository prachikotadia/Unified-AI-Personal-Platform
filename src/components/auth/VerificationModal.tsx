import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../../store/auth'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  contactType: 'email' | 'phone'
  contact: string
  onVerificationSuccess: () => void
}

const VerificationModal = ({
  isOpen,
  onClose,
  userId,
  contactType,
  contact,
  onVerificationSuccess
}: VerificationModalProps) => {
  const [code, setCode] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { verifyCode, resendVerification, error, clearError } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      setCountdown(60) // 60 seconds cooldown for resend
    }
  }, [isOpen])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return

    clearError()
    const success = await verifyCode(userId, contactType, code)
    if (success) {
      onVerificationSuccess()
      onClose()
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    clearError()
    const success = await resendVerification(userId, contactType)
    if (success) {
      setCountdown(60)
    }
    setIsResending(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-charcoal-grey rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verify Your {contactType === 'email' ? 'Email' : 'Phone'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {contactType === 'email' ? (
                  <Mail className="w-5 h-5 text-blue-500" />
                ) : (
                  <Phone className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We've sent a 6-digit code to:
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">{contact}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Enter verification code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={code.length !== 6}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify Code
                </button>
              </form>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0 || isResending}
                  className="text-sm text-blue-gradient-from hover:text-blue-gradient-to transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 mx-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resending...</span>
                    </>
                  ) : countdown > 0 ? (
                    <span>Resend in {countdown}s</span>
                  ) : (
                    <span>Resend code</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VerificationModal
