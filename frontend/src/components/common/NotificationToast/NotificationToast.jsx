import React from 'react';
import { NotificationContainer, NotificationToast } from './NotificationToast.styles';

const NotificationToastComponent = ({ notifications, removeNotification }) => {
  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationToast key={notification.id} type={notification.type}>
          <div className="notification-header">
            <div className="notification-content">
              <span className="icon">{notification.icon}</span>
              <span className="title">{notification.title}</span>
            </div>
            <button 
              className="close-btn"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
          </div>
          <div className="message">{notification.message}</div>
          <div className="timestamp">
            {notification.timestamp.toLocaleTimeString()}
          </div>
        </NotificationToast>
      ))}
    </NotificationContainer>
  );
};

export default NotificationToastComponent;
