import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendRecording: (audioBlob: Blob, duration: number) => void;
}

const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ isOpen, onClose, onSendRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied. Please allow microphone access to record voice messages.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleDelete = () => {
    setRecordedAudio(null);
    setAudioUrl(null);
    setDuration(0);
  };

  const handleSend = () => {
    if (recordedAudio) {
      onSendRecording(recordedAudio, duration);
      onClose();
      // Reset
      setRecordedAudio(null);
      setAudioUrl(null);
      setDuration(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Voice Message</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {!recordedAudio ? (
            <>
              <div className="text-center py-8">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  isRecording ? 'bg-red-100 dark:bg-red-900/20 animate-pulse' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Mic className={`w-16 h-16 ${isRecording ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <p className="text-lg font-semibold mb-2">
                  {isRecording ? 'Recording...' : 'Ready to Record'}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(duration)}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center gap-2"
                  >
                    <Mic size={20} />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center gap-2"
                  >
                    <Square size={20} />
                    Stop Recording
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recording Complete</p>
                <p className="text-xl font-bold">{formatTime(duration)}</p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePlay}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceRecorderModal;

