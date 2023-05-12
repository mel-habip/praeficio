import './wdyr'; // <--- first import
import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './App.css';

import ErrorBoundary from './ErrorBoundary';

const ErrorPage = lazy(() => import('./pages/ErrorPage'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode className="root">
    <ErrorBoundary fallback={<ErrorPage />} >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
