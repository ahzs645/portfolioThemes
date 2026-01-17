import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { ConfigProvider } from './contexts/ConfigContext';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StyleSheetManager disableCSSOMInjection={import.meta.env.PROD}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </StyleSheetManager>
  </React.StrictMode>
);
