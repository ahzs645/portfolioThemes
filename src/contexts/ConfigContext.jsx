import React, { createContext, useContext, useState, useEffect } from 'react';
import yaml from 'js-yaml';

const ConfigContext = createContext(null);

// Path to your CV.yaml - adjust as needed
const CV_YAML_PATH = '/Users/ahmadjalil/Github/resumerr/CV.yaml';

export function ConfigProvider({ children }) {
  const [cvData, setCvData] = useState(null);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCV() {
      try {
        // In development, we'll fetch from public folder or use import
        // For now, try fetching from public/CV.yaml
        const response = await fetch('/CV.yaml');
        if (!response.ok) {
          throw new Error(`Failed to load CV.yaml: ${response.status}`);
        }
        const text = await response.text();
        const data = yaml.load(text);
        setCvData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading CV:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    loadCV();
  }, []);

  function getAboutContent() {
    // Return about section from config or CV
    const aboutSection = cvData?.cv?.sections?.about;
    if (aboutSection) {
      return { markdown: aboutSection };
    }
    return { markdown: '' };
  }

  const value = {
    cvData,
    config,
    setConfig,
    loading,
    error,
    getAboutContent,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
