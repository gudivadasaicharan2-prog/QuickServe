import React from 'react';
const PrimaryButton = ({ onClick, children }) => (
  <button onClick={onClick} className="primary-btn">{children}</button>
);
export default PrimaryButton;
