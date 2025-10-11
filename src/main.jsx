
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; 
import App from '@/App';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { HelmetProvider } from 'react-helmet-async';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
