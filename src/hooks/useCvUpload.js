import { useState, useRef, useCallback } from 'react';
import { useConfig } from '../contexts/ConfigContext';

// Encapsulates CV.yaml uploading: file-picker handling, drag-and-drop, validation
// errors, and the reset/isCustom flags from ConfigContext.
export function useCvUpload() {
  const { uploadCV, resetCV, isCustomCV } = useConfig();
  const [uploadErrors, setUploadErrors] = useState([]);
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    setUploadErrors([]);

    // Check file extension
    const validExtensions = ['.yaml', '.yml'];
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setUploadErrors(['Upload a .yaml or .yml file.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const result = uploadCV(content);
        if (!result.success) {
          setUploadErrors(result.errors || [`Error parsing CV: ${result.error}`]);
        }
      }
    };
    reader.onerror = () => {
      setUploadErrors(['Error reading file.']);
    };
    reader.readAsText(file);
  }, [uploadCV]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset input so same file can be uploaded again
    event.target.value = '';
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  }, [processFile]);

  return {
    uploadErrors,
    fileInputRef,
    handleFileUpload,
    handleDragOver,
    handleDrop,
    resetCV,
    isCustomCV,
  };
}
