
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { registerQuillModules } from '@/lib/quill/quill.register.js';
import '@/index.css';
import 'react-quill/dist/quill.snow.css';
import '@/lib/quill/quill.custom.css';

registerQuillModules();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
