import { motion } from 'framer-motion'
import { useState } from 'react'
import { Settings, Bell, Shield, Palette, Download, Trash2 } from 'lucide-react'
import { useThemeStore } from '../store/theme'

const SettingsPage = () => {
  const { theme, setTheme, setSystem } = useThemeStore()
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false
  })

  const settingsSections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          type: 'select',
          value: theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ],
          onChange: (value: string) => {
            if (value === 'system') {
              setSystem(true)
            } else {
              setTheme(value as 'light' | 'dark')
            }
          }
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Email Notifications',
          type: 'toggle',
          value: notifications.email,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, email: value }))
        },
        {
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications.push,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, push: value }))
        },
        {
          label: 'Marketing Emails',
          type: 'toggle',
          value: notifications.marketing,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, marketing: value }))
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Two-Factor Authentication',
          type: 'button',
          action: 'Enable',
          onClick: () => console.log('Enable 2FA')
        },
        {
          label: 'Change Password',
          type: 'button',
          action: 'Update',
          onClick: () => console.log('Change password')
        }
      ]
    },
    {
      title: 'Data & Export',
      icon: Download,
      items: [
        {
          label: 'Export Data',
          type: 'button',
          action: 'Download',
          onClick: () => console.log('Export data')
        },
        {
          label: 'Delete Account',
          type: 'button',
          action: 'Delete',
          danger: true,
          onClick: () => console.log('Delete account')
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customize your OmniLife experience
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <section.icon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div>
                    <h3 className="font-medium">{item.label}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>

                  <div>
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}

                    {item.type === 'select' && (
                      <select
                        value={item.value}
                        onChange={(e) => item.onChange(e.target.value)}
                        className="px-3 py-1 bg-white/50 dark:bg-black/50 rounded-lg border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-gradient-from"
                      >
                        {item.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {item.type === 'button' && (
                      <button
                        onClick={item.onClick}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.danger
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-blue-gradient-from text-white hover:bg-blue-gradient-to'
                        }`}
                      >
                        {item.action}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default SettingsPage
