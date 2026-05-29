import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import yaml from 'js-yaml';
import {
  flattenExperience,
  normalizeSocialLinks,
  normalizeHighlights,
  filterActive,
  getCurrentJobTitle,
} from '../utils/cvHelpers';
import { normalizeMarkdownInObject } from '../utils/parseMarkdown';
import { validateCVData } from '../utils/cvValidation';
import { withBase } from '../utils/assetPath';

const ConfigContext = createContext(null);
const CUSTOM_CV_STORAGE_KEY = 'portfolioThemes-customCV';

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return null;
}

function parsePositiveNumber(value) {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;

  return {
    ...entry,
    highlights: normalizeHighlights(entry.highlights),
    positions: Array.isArray(entry.positions)
      ? entry.positions.map((position) => normalizeEntry(position))
      : entry.positions,
  };
}

function normalizeSectionEntries(entries = []) {
  return Array.isArray(entries) ? entries.map((entry) => normalizeEntry(entry)) : [];
}

export function ConfigProvider({ children }) {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCustomCV, setIsCustomCV] = useState(false);

  useEffect(() => {
    async function loadCV() {
      try {
        const stored = localStorage.getItem(CUSTOM_CV_STORAGE_KEY);
        if (stored) {
          const data = yaml.load(stored);
          const validationErrors = validateCVData(data);
          if (validationErrors.length === 0) {
            setCvData(normalizeMarkdownInObject(data));
            setIsCustomCV(true);
            setLoading(false);
            return;
          }
          localStorage.removeItem(CUSTOM_CV_STORAGE_KEY);
        }

        const response = await fetch(withBase('CV.yaml'));
        if (!response.ok) {
          throw new Error(`Failed to load CV.yaml: ${response.status}`);
        }
        const text = await response.text();
        const data = yaml.load(text);
        // Normalize markdown in the raw data so all themes get clean text
        const normalizedData = normalizeMarkdownInObject(data);
        setCvData(normalizedData);
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
  // Note: Markdown is already stripped at load time via normalizeMarkdownInObject
  const cv = useMemo(() => {
    if (!cvData?.cv) return null;

    const raw = cvData.cv;
    const sections = raw.sections || {};
    const normalizedSections = {
      ...sections,
      experience: normalizeSectionEntries(sections.experience),
      projects: normalizeSectionEntries(sections.projects),
      education: normalizeSectionEntries(sections.education),
      awards: normalizeSectionEntries(sections.awards),
      publications: normalizeSectionEntries(sections.publications),
      presentations: normalizeSectionEntries(sections.presentations),
      volunteer: normalizeSectionEntries(sections.volunteer),
      certifications: normalizeSectionEntries(sections.certifications),
      professional_development: normalizeSectionEntries(sections.professional_development),
    };
    const avatar = pickFirstString(
      raw.avatar,
      raw.avatar_url,
      raw.image,
      raw.image_url,
      raw.photo,
      raw.photo_url,
      raw.portrait,
      raw.headshot,
      raw.hero_image,
      raw.heroImage,
    );
    const avatarAspect = parsePositiveNumber(
      raw.avatar_aspect ??
        raw.image_aspect ??
        raw.photo_aspect ??
        raw.portrait_aspect ??
        raw.hero_image_aspect ??
        raw.heroImageAspect,
    );

    return {
      // Basic info
      name: raw.name || '',
      label: raw.label || raw.headline || raw.tagline || null,
      headline: raw.headline || raw.label || raw.tagline || null,
      tagline: raw.tagline || raw.headline || raw.label || null,
      email: raw.email || null,
      phone: raw.phone || null,
      location: raw.location || null,
      website: raw.website || null,
      avatar,
      avatarAspect,

      // About/summary text
      about: sections.about || '',

      // Normalized social links
      socialLinks: normalizeSocialLinks(raw.social || raw.social_networks || [], raw.email),

      // Raw social array (for themes that need custom handling)
      social: raw.social || raw.social_networks || [],
      socialRaw: raw.social || raw.social_networks || [],

      // Current job title (derived)
      currentJobTitle: getCurrentJobTitle(normalizedSections.experience),

      // Pre-processed sections
      experience: flattenExperience(normalizedSections.experience || []),
      projects: filterActive(normalizedSections.projects || []),
      education: filterActive(normalizedSections.education || []),
      skills: normalizedSections.skills || [],
      languages: normalizedSections.languages || [],
      awards: filterActive(normalizedSections.awards || []),
      publications: filterActive(normalizedSections.publications || []),
      presentations: filterActive(normalizedSections.presentations || []),
      volunteer: flattenExperience(normalizedSections.volunteer || []),
      certifications: filterActive(normalizedSections.certifications || []),
      professionalDevelopment: filterActive(normalizedSections.professional_development || []),
      certificationsSkills: normalizedSections.certifications_skills || [],

      // Raw sections
      sections,
      sectionsRaw: sections,
    };
  }, [cvData]);

  // Backward compatibility helper (deprecated - use cv.about instead)
  const getAboutContent = () => {
    return { markdown: cv?.about || '' };
  };

  // Function to upload new CV data from a YAML string
  const uploadCV = (yamlString) => {
    try {
      const data = yaml.load(yamlString);
      const validationErrors = validateCVData(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: validationErrors[0],
          errors: validationErrors,
        };
      }
      // Normalize markdown in the raw data so all themes get clean text
      const normalizedData = normalizeMarkdownInObject(data);
      setCvData(normalizedData);
      setError(null);
      setIsCustomCV(true);
      localStorage.setItem(CUSTOM_CV_STORAGE_KEY, yamlString);
      return { success: true };
    } catch (err) {
      console.error('Error parsing uploaded CV:', err);
      return { success: false, error: err.message };
    }
  };

  // Function to reset to original CV
  const resetCV = async () => {
    setLoading(true);
    try {
      const response = await fetch(withBase('CV.yaml'));
      if (!response.ok) {
        throw new Error(`Failed to load CV.yaml: ${response.status}`);
      }
      const text = await response.text();
      const data = yaml.load(text);
      // Normalize markdown in the raw data so all themes get clean text
      const normalizedData = normalizeMarkdownInObject(data);
      setCvData(normalizedData);
      setError(null);
      setIsCustomCV(false);
      localStorage.removeItem(CUSTOM_CV_STORAGE_KEY);
      setLoading(false);
    } catch (err) {
      console.error('Error resetting CV:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const value = {
    // Raw data (for backward compatibility)
    cvData,

    // Normalized data (preferred)
    cv,

    // Loading state
    loading,
    error,

    // Upload/reset functions
    uploadCV,
    resetCV,
    isCustomCV,

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
