
import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface NotificationItemProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const typeConfig = {
  success: {
    classes: 'bg-green-50 border-green-500 text-green-800',
    title: 'สำเร็จ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  error: {
    classes: 'bg-red-50 border-red-500 text-red-800',
    title: 'ข้อผิดพลาด',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  },
  info: {
    classes: 'bg-blue-50 border-blue-500 text-blue-800',
    title: 'ข้อมูล',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = typeConfig[type];

  return (
    <div 
        className={`p-4 mb-4 rounded-xl border-l-4 shadow-lg flex items-start gap-4 animate-fade-in-right ${config.classes}`} 
        role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="flex-grow">
        <p className="font-bold">{config.title}</p>
        <p className="text-sm">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className={`ml-auto -mr-2 -mt-2 p-1.5 rounded-lg focus:ring-2 inline-flex ${config.classes}`} 
        aria-label="Close"
      >
          <XIcon />
      </button>
    </div>
  );
};

export default NotificationItem;