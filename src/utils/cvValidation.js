function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatIssue(path, message) {
  return path ? `${path}: ${message}` : message;
}

function requireArray(errors, source, path) {
  const value = path.split('.').reduce((acc, key) => acc?.[key], source);
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(formatIssue(path, 'must be a list.'));
  }
}

export function validateCVData(data) {
  const errors = [];

  if (!isPlainObject(data)) {
    return ['File must contain a YAML object with a top-level cv field.'];
  }

  if (!isPlainObject(data.cv)) {
    return ['cv: required top-level object is missing.'];
  }

  const { cv } = data;
  if (!hasText(cv.name)) {
    errors.push(formatIssue('cv.name', 'is required.'));
  }

  if (cv.email !== undefined && !hasText(cv.email)) {
    errors.push(formatIssue('cv.email', 'must be text when provided.'));
  }

  if (cv.website !== undefined && !hasText(cv.website)) {
    errors.push(formatIssue('cv.website', 'must be text when provided.'));
  }

  if (cv.social !== undefined && !Array.isArray(cv.social)) {
    errors.push(formatIssue('cv.social', 'must be a list.'));
  }

  if (cv.social !== undefined && Array.isArray(cv.social)) {
    cv.social.forEach((item, index) => {
      if (!isPlainObject(item)) {
        errors.push(formatIssue(`cv.social[${index}]`, 'must be an object.'));
        return;
      }
      if (!hasText(item.network)) {
        errors.push(formatIssue(`cv.social[${index}].network`, 'is required.'));
      }
      if (!hasText(item.url)) {
        errors.push(formatIssue(`cv.social[${index}].url`, 'is required.'));
      }
    });
  }

  if (cv.sections !== undefined && !isPlainObject(cv.sections)) {
    errors.push(formatIssue('cv.sections', 'must be an object.'));
    return errors;
  }

  const sections = cv.sections || {};
  [
    'experience',
    'projects',
    'education',
    'skills',
    'languages',
    'awards',
    'publications',
    'presentations',
    'volunteer',
    'certifications',
    'professional_development',
    'certifications_skills',
  ].forEach((section) => requireArray(errors, data, `cv.sections.${section}`));

  return errors;
}
