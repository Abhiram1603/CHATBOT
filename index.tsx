
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: The import path for App should be './App' to correctly reference the App.tsx file in the same directory.
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);