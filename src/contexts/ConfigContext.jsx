import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import yaml from 'js-yaml';
import {
  flattenExperience,
  normalizeSocialLinks,
  filterActive,
  getCurrentJobTitle,
} from '../utils/cvHelpers';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCV() {
      try {
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

  // Normalized CV data - computed once when cvData changes
  const cv = useMemo(() => {
    if (!cvData?.cv) return null;

    const raw = cvData.cv;
    const sections = raw.sections || {};

    return {
      // Basic info
      name: raw.name || '',
      email: raw.email || null,
      phone: raw.phone || null,
      location: raw.location || null,
      website: raw.website || null,

      // About/summary text
      about: sections.about || '',

      // Normalized social links
      socialLinks: normalizeSocialLinks(raw.social || [], raw.email),

      // Raw social array (for themes that need custom handling)
      socialRaw: raw.social || [],

      // Current job title (derived)
      currentJobTitle: getCurrentJobTitle(sections.experience),

      // Pre-processed sections
      experience: flattenExperience(sections.experience || []),
      projects: filterActive(sections.projects || []),
      education: filterActive(sections.education || []),
      skills: sections.skills || [],
      languages: sections.languages || [],
      awards: filterActive(sections.awards || []),
      publications: filterActive(sections.publications || []),
      presentations: filterActive(sections.presentations || []),
      volunteer: flattenExperience(sections.volunteer || []),
      certifications: filterActive(sections.certifications || []),

      // Raw sections (for themes that need unprocessed data)
      sectionsRaw: sections,
    };
  }, [cvData]);

  // Backward compatibility helper (deprecated - use cv.about instead)
  const getAboutContent = () => {
    return { markdown: cv?.about || '' };
  };

  const value = {
    // Raw data (for backward compatibility)
    cvData,

    // Normalized data (preferred)
    cv,

    // Loading state
    loading,
    error,

    // Deprecated - for backward compatibility with unmigrated themes
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

/**
 * Convenience hook that returns just the normalized CV data
 * Returns null while loading
 */
export function useCV() {
  const { cv } = useConfig();
  return cv;
}
