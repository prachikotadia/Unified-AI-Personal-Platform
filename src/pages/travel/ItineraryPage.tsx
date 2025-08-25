import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'

const ItineraryPage = () => {
  // Mock itinerary data
  const itinerary = {
    trip: {
      destination: 'Tokyo, Japan',
      dates: 'Mar 15-22, 2024',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
    },
    days: [
      {
        day: 1,
        date: 'Mar 15',
        activities: [
          { time: '09:00', activity: 'Arrive at Narita Airport', location: 'Narita Airport' },
          { time: '11:00', activity: 'Check into hotel', location: 'Shinjuku' },
          { time: '14:00', activity: 'Visit Senso-ji Temple', location: 'Asakusa' },
          { time: '18:00', activity: 'Dinner at local ramen shop', location: 'Shinjuku' },
        ]
      },
      {
        day: 2,
        date: 'Mar 16',
        activities: [
          { time: '08:00', activity: 'Breakfast at hotel', location: 'Hotel' },
          { time: '10:00', activity: 'Visit Tokyo Skytree', location: 'Sumida' },
          { time: '14:00', activity: 'Explore Akihabara', location: 'Akihabara' },
          { time: '19:00', activity: 'Sushi dinner', location: 'Ginza' },
        ]
      },
    ]
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trip Itinerary</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {itinerary.trip.destination} • {itinerary.trip.dates}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn-secondary flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="btn-primary">
              Edit Itinerary
            </button>
          </div>
        </div>
      </motion.div>

      {/* Trip Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center space-x-6">
          <img
            src={itinerary.trip.image}
            alt={itinerary.trip.destination}
            className="w-32 h-24 object-cover rounded-lg"
          />
          <div>
            <h2 className="text-2xl font-bold mb-2">{itinerary.trip.destination}</h2>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{itinerary.trip.dates}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Japan</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Itinerary */}
      <div className="space-y-6">
        {itinerary.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + dayIndex * 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold mb-4">Day {day.day} - {day.date}</h3>
            
            <div className="space-y-4">
              {day.activities.map((activity, activityIndex) => (
                <motion.div
                  key={activityIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + dayIndex * 0.1 + activityIndex * 0.05 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className="text-sm font-medium text-gray-500">{activity.time}</span>
                  </div>
                  
                  <div className="flex-shrink-0 w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.activity}</h4>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
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

export default ItineraryPage
