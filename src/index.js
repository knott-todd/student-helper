import React from 'react';
import ReactDOM from 'react-dom/client';
import './CSS/index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals';
import AppContext from './AppContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ThemeProvider } from './CSS/theme-provider';
import { UserProvider } from './features/auth/UserContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element with id 'root' not found");
}
const root = ReactDOM.createRoot(rootElement);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

root.render(
  // <React.StrictMode>
  // <BrowserRouter>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}>
      <AppContext>
        <UserProvider>
            <ThemeProvider>

              <App />
            </ThemeProvider>
          
        </UserProvider>
      </AppContext>
    </PersistQueryClientProvider>
  // </BrowserRouter>
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
