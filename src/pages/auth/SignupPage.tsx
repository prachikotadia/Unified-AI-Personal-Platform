import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Github, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { cn } from '../../lib/utils'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  verificationMethod: z.enum(['email', 'sms']).default('email'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.verificationMethod === 'sms' && !data.phone) {
    return false
  }
  return true
}, {
  message: "Phone number is required for SMS verification",
  path: ["phone"],
})

type SignupForm = z.infer<typeof signupSchema>

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signup, loginWithOAuth, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupForm) => {
    clearError()
    try {
      await signup(data.email, data.username, data.password, data.verificationMethod)
      navigate('/')
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider)
    clearError()
    try {
      await loginWithOAuth(provider)
      navigate('/')
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsOAuthLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="glass-card p-8 rounded-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-gradient-from to-blue-gradient-to rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-white text-2xl font-bold">O</span>
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join OmniLife and start your AI-powered lifestyle journey
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignup('google')}
            disabled={isLoading || isOAuthLoading === 'google'}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isOAuthLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuthSignup('github')}
            disabled={isLoading || isOAuthLoading === 'github'}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isOAuthLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-charcoal-grey text-gray-500">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                id="email"
                className={cn(
                  "input-field pl-10",
                  errors.email && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('username')}
                type="text"
                id="username"
                className={cn(
                  "input-field pl-10",
                  errors.username && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Choose a username"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Verification Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Verification Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  {...register('verificationMethod')}
                  type="radio"
                  value="email"
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-500">Send code to email</div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  {...register('verificationMethod')}
                  type="radio"
                  value="sms"
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">SMS</div>
                  <div className="text-sm text-gray-500">Send code to phone</div>
                </div>
              </label>
            </div>
          </div>

          {/* Phone Number (conditional) */}
          {watch('verificationMethod') === 'sms' && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className={cn(
                    "input-field pl-10",
                    errors.phone && "border-red-500 focus:ring-red-500"
                  )}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={cn(
                  "input-field pl-10 pr-10",
                  errors.password && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className={cn(
                  "input-field pl-10 pr-10",
                  errors.confirmPassword && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
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
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-gradient-from hover:text-blue-gradient-to transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SignupPage
