// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Changed from './style.css'
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);