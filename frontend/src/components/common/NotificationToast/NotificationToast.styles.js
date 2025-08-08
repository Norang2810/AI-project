import styled from 'styled-components';

export const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const NotificationToast = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'danger': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  }};
  color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  animation: slideInFromRight 0.3s ease-out;
  
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .icon {
    font-size: 20px;
  }

  .title {
    font-weight: bold;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .message {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .timestamp {
    font-size: 12px;
    opacity: 0.8;
  }
`;
