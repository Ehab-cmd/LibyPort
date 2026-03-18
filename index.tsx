
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as ReactRouterDOM from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

// تفعيل تسجيل الـ Service Worker بطريقة ذكية تتعرف على المسار الحالي
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = './service-worker.js';
    
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('Service Worker registered successfully with scope:', registration.scope);
      })
      .catch(error => {
        if (error.message.includes('origin')) {
          console.info('Service Worker registration skipped: Origin restriction in preview mode.');
        } else {
          console.warn('Service Worker registration failed:', error);
        }
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ReactRouterDOM.HashRouter>
        <AppProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AppProvider>
      </ReactRouterDOM.HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
