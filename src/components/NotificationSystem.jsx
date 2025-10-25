import React, { useState, useEffect, useCallback } from 'react';

/**
 * Notification System Component
 * Provides user feedback for export operations with different types and auto-dismiss
 */
const NotificationSystem = ({ 
  notifications = [], 
  onDismiss = null,
  position = 'top-right',
  autoHideDuration = 5000 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Update visible notifications when props change
  useEffect(() => {
    setVisibleNotifications(notifications.map(notification => ({
      ...notification,
      id: notification.id || Date.now() + Math.random(),
      timestamp: notification.timestamp || Date.now(),
      visible: true
    })));
  }, [notifications]);

  // Auto-hide notifications
  useEffect(() => {
    const timers = [];

    visibleNotifications.forEach(notification => {
      if (notification.type !== 'error' && notification.autoHide !== false) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, autoHideDuration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications, autoHideDuration]);

  const handleDismiss = useCallback((notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    
    if (onDismiss) {
      onDismiss(notificationId);
    }
  }, [onDismiss]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      case 'loading':
        return 'fas fa-spinner fa-spin';
      default:
        return 'fas fa-bell';
    }
  };

  const getNotificationClass = (type) => {
    const baseClass = 'notification';
    switch (type) {
      case 'success':
        return `${baseClass} notification-success`;
      case 'error':
        return `${baseClass} notification-error`;
      case 'warning':
        return `${baseClass} notification-warning`;
      case 'info':
        return `${baseClass} notification-info`;
      case 'loading':
        return `${baseClass} notification-loading`;
      default:
        return `${baseClass} notification-default`;
    }
  };

  const getPositionClass = () => {
    switch (position) {
      case 'top-left':
        return 'notifications-top-left';
      case 'top-right':
        return 'notifications-top-right';
      case 'bottom-left':
        return 'notifications-bottom-left';
      case 'bottom-right':
        return 'notifications-bottom-right';
      case 'top-center':
        return 'notifications-top-center';
      case 'bottom-center':
        return 'notifications-bottom-center';
      default:
        return 'notifications-top-right';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  const notificationCSS = `
    .notifications-container {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      max-width: 400px;
      width: 100%;
    }

    .notifications-top-right {
      top: 20px;
      right: 20px;
    }

    .notifications-top-left {
      top: 20px;
      left: 20px;
    }

    .notifications-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .notifications-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .notifications-top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .notifications-bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    .notification {
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid #e2e8f0;
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .notification::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #cbd5e0;
    }

    .notification-success::before {
      background: linear-gradient(135deg, #48bb78, #38a169);
    }

    .notification-error::before {
      background: linear-gradient(135deg, #f56565, #e53e3e);
    }

    .notification-warning::before {
      background: linear-gradient(135deg, #ed8936, #dd6b20);
    }

    .notification-info::before {
      background: linear-gradient(135deg, #4299e1, #3182ce);
    }

    .notification-loading::before {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .notification-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }

    .notification-success .notification-icon {
      color: #38a169;
    }

    .notification-error .notification-icon {
      color: #e53e3e;
    }

    .notification-warning .notification-icon {
      color: #dd6b20;
    }

    .notification-info .notification-icon {
      color: #3182ce;
    }

    .notification-loading .notification-icon {
      color: #667eea;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: #2d3748;
      margin: 0 0 4px 0;
      line-height: 1.4;
    }

    .notification-message {
      font-size: 13px;
      color: #4a5568;
      margin: 0;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .notification-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .notification-action {
      background: none;
      border: 1px solid #e2e8f0;
      color: #4a5568;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notification-action:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    .notification-action-primary {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .notification-action-primary:hover {
      background: #5a67d8;
      border-color: #5a67d8;
    }

    .notification-dismiss {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: #a0aec0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      font-size: 12px;
    }

    .notification-dismiss:hover {
      color: #718096;
      background: #f7fafc;
    }

    .notification-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: #e2e8f0;
      animation: progress linear;
    }

    .notification-success .notification-progress {
      background: #38a169;
    }

    .notification-error .notification-progress {
      background: #e53e3e;
    }

    .notification-warning .notification-progress {
      background: #dd6b20;
    }

    .notification-info .notification-progress {
      background: #3182ce;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .notifications-container {
        max-width: calc(100vw - 40px);
        left: 20px !important;
        right: 20px !important;
        transform: none !important;
      }

      .notification {
        padding: 14px 16px;
        margin-bottom: 10px;
        border-radius: 10px;
      }

      .notification-title {
        font-size: 13px;
      }

      .notification-message {
        font-size: 12px;
      }

      .notification-action {
        padding: 3px 6px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .notifications-container {
        max-width: calc(100vw - 20px);
        left: 10px !important;
        right: 10px !important;
      }

      .notification {
        padding: 12px 14px;
        gap: 10px;
      }

      .notification-icon {
        width: 18px;
        height: 18px;
      }
    }
  `;

  return (
    <>
      <style>{notificationCSS}</style>
      <div className={`notifications-container ${getPositionClass()}`}>
        {visibleNotifications.map(notification => (
          <div
            key={notification.id}
            className={getNotificationClass(notification.type)}
            role="alert"
            aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
          >
            <div className="notification-icon">
              <i className={getNotificationIcon(notification.type)}></i>
            </div>
            
            <div className="notification-content">
              {notification.title && (
                <div className="notification-title">{notification.title}</div>
              )}
              <div className="notification-message">{notification.message}</div>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="notification-actions">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      className={`notification-action ${action.primary ? 'notification-action-primary' : ''}`}
                      onClick={() => action.onClick && action.onClick(notification)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {notification.dismissible !== false && (
              <button
                className="notification-dismiss"
                onClick={() => handleDismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                <i className="fas fa-times"></i>
              </button>
            )}

            {notification.type !== 'error' && notification.autoHide !== false && (
              <div 
                className="notification-progress"
                style={{
                  animationDuration: `${autoHideDuration}ms`
                }}
              ></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * Hook for managing notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      title: options.title || 'Success',
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      title: options.title || 'Error',
      autoHide: false, // Errors don't auto-hide by default
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      title: options.title || 'Warning',
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      title: options.title || 'Info',
      ...options
    });
  }, [addNotification]);

  const showLoading = useCallback((message, options = {}) => {
    return addNotification({
      type: 'loading',
      message,
      title: options.title || 'Loading',
      autoHide: false, // Loading notifications don't auto-hide
      dismissible: false, // Can't be manually dismissed
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};

export default NotificationSystem;