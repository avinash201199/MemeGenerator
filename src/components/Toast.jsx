import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Toast Notification Component
 * Displays temporary notification messages with different variants
 */
const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right max-w-md";
    
    const variants = {
      success: "bg-green-600 text-white border-l-4 border-green-400",
      error: "bg-red-600 text-white border-l-4 border-red-400",
      warning: "bg-yellow-600 text-white border-l-4 border-yellow-400",
      info: "bg-blue-600 text-white border-l-4 border-blue-400",
    };

    return `${baseStyles} ${variants[type] || variants.info}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={getToastStyles()}>
      <span className="text-2xl">{getIcon()}</span>
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors font-bold text-xl leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default Toast;

