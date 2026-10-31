import React from 'react';
import ReactDOM from 'react-dom/client';
import './CSS/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppContext from './AppContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  // <BrowserRouter>
    <AppContext>
      <App />
    </AppContext>
  // </BrowserRouter>
  // </React.StrictMode>
);

// The app-shell service worker is retired for the relaunch so returning
// users never get a stale cached build (see src/service-worker.js).
// Offline support is off until it is reintroduced with an update prompt.
serviceWorkerRegistration.unregisterAppShellWorker();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
