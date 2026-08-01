import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${size}`}></div>
    </div>
  );
};

export default LoadingSpinner;
