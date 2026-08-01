import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message-container">
      <div className="error-message-content">
        <span className="error-icon">⚠️</span>
        <h3 className="error-title">Error</h3>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
