import { X } from 'lucide-react';
import Link from 'next/link';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLink: string;
  actionText: string;
}

export function InfoModal({ isOpen, onClose, title, message, actionLink, actionText }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900/95 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mt-2">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <Link
              href={actionLink}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 
                       text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 
                       transition-all transform hover:scale-105"
            >
              {actionText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 