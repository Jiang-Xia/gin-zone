import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'tdesign-react/es/style/index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './store/auth';
import { LayoutSettingsProvider } from './store/layout';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LayoutSettingsProvider>
          <App />
        </LayoutSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
