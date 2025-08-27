import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Users, DollarSign, FileText, Save, Plus } from 'lucide-react'
import { TripCreate } from '../../services/travelAPI'

interface TripModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (trip: TripCreate) => Promise<void>
  trip?: any // For editing existing trip
  mode: 'create' | 'edit'
}

const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  trip,
  mode
}) => {
  const [formData, setFormData] = useState<TripCreate>({
    title: '',
    description: '',
    trip_type: 'leisure',
    destination: '',
    start_date: '',
    end_date: '',
    budget: undefined,
    currency: 'USD',
    travelers: []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when editing
  useEffect(() => {
    if (trip && mode === 'edit') {
      setFormData({
        title: trip.title || '',
        description: trip.description || '',
        trip_type: trip.trip_type || 'leisure',
        destination: trip.destination || '',
        start_date: trip.start_date || '',
        end_date: trip.end_date || '',
        budget: trip.budget || undefined,
        currency: trip.currency || 'USD',
        travelers: trip.travelers || []
      })
    }
  }, [trip, mode])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Trip title is required'
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (startDate >= endDate) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TripCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTraveler = () => {
    setFormData(prev => ({
      ...prev,
      travelers: [...prev.travelers, { name: '', age: 0 }]
    }))
  }

  const removeTraveler = (index: number) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.filter((_, i) => i !== index)
    }))
  }

  const updateTraveler = (index: number, field: 'name' | 'age', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.map((traveler, i) => 
        i === index ? { ...traveler, [field]: value } : traveler
      )
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {mode === 'create' ? 'Create New Trip' : 'Edit Trip'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trip Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter trip title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe your trip"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trip Type
                    </label>
                    <select
                      value={formData.trip_type}
                      onChange={(e) => handleInputChange('trip_type', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="leisure">Leisure</option>
                      <option value="business">Business</option>
                      <option value="family">Family</option>
                      <option value="adventure">Adventure</option>
                      <option value="romantic">Romantic</option>
                      <option value="solo">Solo</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>

                {/* Destination & Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Destination & Dates
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Destination *
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.destination ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Tokyo, Japan"
                    />
                    {errors.destination && (
                      <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.start_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.start_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.end_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.end_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Budget Amount
                      </label>
                      <input
                        type="number"
                        value={formData.budget || ''}
                        onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="AUD">AUD (A$)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Travelers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Travelers
                    </h3>
                    <button
                      type="button"
                      onClick={addTraveler}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Traveler
                    </button>
                  </div>
                  
                  {formData.travelers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No travelers added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.travelers.map((traveler, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={traveler.name}
                              onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Traveler name"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">
                              Age
                            </label>
                            <input
                              type="number"
                              value={traveler.age}
                              onChange={(e) => updateTraveler(index, 'age', parseInt(e.target.value) || 0)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Age"
                              min="0"
                              max="120"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTraveler(index)}
                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {mode === 'create' ? 'Create Trip' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TripModal
