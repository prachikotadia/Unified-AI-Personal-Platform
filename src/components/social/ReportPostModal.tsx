import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { useToastHelpers } from '../../components/ui/Toast';

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onSubmit: (reason: string, description: string) => void;
}

const ReportPostModal: React.FC<ReportPostModalProps> = ({ isOpen, onClose, postId, onSubmit }) => {
  const { success } = useToastHelpers();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportReasons = [
    'Spam',
    'Harassment or Bullying',
    'False Information',
    'Inappropriate Content',
    'Violence or Dangerous Content',
    'Intellectual Property Violation',
    'Other'
  ];

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, description);
    success('Report Submitted', 'Thank you for reporting. We will review this content.');
    onClose();
    setReason('');
    setDescription('');
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
          <div className="flex items-center gap-2">
            <Flag className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold">Report Post</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please select a reason for reporting this post. False reports may result in action against your account.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reason for Reporting *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a reason</option>
              {reportReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more information about why you're reporting this post..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportPostModal;

