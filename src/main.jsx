import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { ConfigProvider } from './contexts/ConfigContext';
import { GitHubProvider } from './contexts/GitHubContext';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyleSheetManager disableCSSOMInjection={import.meta.env.PROD}>
      <ConfigProvider>
        <GitHubProvider>
          <App />
        </GitHubProvider>
      </ConfigProvider>
    </StyleSheetManager>
  </React.StrictMode>
);
