import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';

const ChatTest: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isLoading, 
    error,
    rooms,
    getRooms,
    getUsers
  } = useChatStore();
  
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (user?.id && !isConnected) {
      connect(user.id);
    }
  }, [user?.id, isConnected, connect]);

  const handleTestConnection = () => {
    if (user?.id) {
      connect(user.id);
    }
  };

  const handleLoadData = async () => {
    try {
      await Promise.all([getRooms(), getUsers()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSendTestMessage = () => {
    if (rooms.length > 0 && testMessage.trim()) {
      const firstRoom = rooms[0];
      // This would send a message to the first room
      console.log('Sending test message:', testMessage, 'to room:', firstRoom.id);
      setTestMessage('');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Chat System Test</h2>
      
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <div className="space-y-2">
            <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
            <p>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
          <button 
            onClick={handleTestConnection}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Connection
          </button>
        </div>

        {/* Data Loading */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Data</h3>
          <div className="space-y-2">
            <p>Rooms: {rooms.length}</p>
            <button 
              onClick={handleLoadData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Load Data
            </button>
          </div>
        </div>

        {/* Test Message */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Test Message</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter test message..."
              className="w-full px-3 py-2 border rounded"
            />
            <button 
              onClick={handleSendTestMessage}
              disabled={!testMessage.trim() || rooms.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              Send Test Message
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Available Rooms</h3>
          <div className="space-y-2">
            {rooms.length === 0 ? (
              <p className="text-gray-500">No rooms available</p>
            ) : (
              rooms.map(room => (
                <div key={room.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-gray-600">ID: {room.id}</p>
                  <p className="text-sm text-gray-600">Type: {room.type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTest;
