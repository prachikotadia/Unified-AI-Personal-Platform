import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Languages, Copy, CheckCircle } from 'lucide-react';

interface AITranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  onTranslate?: (translatedText: string, targetLang: string) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }
];

const AITranslateModal: React.FC<AITranslateModalProps> = ({
  isOpen,
  onClose,
  text,
  sourceLanguage = 'auto',
  targetLanguage: initialTargetLanguage,
  onTranslate
}) => {
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage || 'es');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock translation (in real app, call AI translation API)
    const mockTranslations: Record<string, string> = {
      'es': 'Hola, ¿cómo estás?',
      'fr': 'Bonjour, comment allez-vous?',
      'de': 'Hallo, wie geht es dir?',
      'it': 'Ciao, come stai?',
      'pt': 'Olá, como você está?',
      'ru': 'Привет, как дела?',
      'ja': 'こんにちは、元気ですか？',
      'ko': '안녕하세요, 어떻게 지내세요?',
      'zh': '你好，你好吗？',
      'ar': 'مرحبا، كيف حالك؟',
      'hi': 'नमस्ते, आप कैसे हैं?'
    };

    setTranslatedText(mockTranslations[targetLanguage] || text);
    setLoading(false);

    if (onTranslate) {
      onTranslate(mockTranslations[targetLanguage] || text, targetLanguage);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isOpen && text) {
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetLanguage, text]);

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
            <Brain className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">AI Translation</h2>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Powered by AI
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Source Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Text
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
              {text}
            </div>
          </div>

          {/* Target Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Languages className="inline w-4 h-4 mr-1" />
              Translate To
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Translated Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Translation
            </label>
            {loading ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm min-h-[60px]">
                {translatedText || 'Translation will appear here...'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {translatedText && (
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AITranslateModal;

