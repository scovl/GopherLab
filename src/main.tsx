import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ProgressProvider } from './context/ProgressContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);
