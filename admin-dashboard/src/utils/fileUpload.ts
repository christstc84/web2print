// File upload utility for handling font files
export interface FontFile {
  name: string;
  displayName: string;
  file: File;
  fontFamily: string;
  format: 'ttf' | 'otf' | 'woff' | 'woff2';
}

// Validate font file
export const validateFontFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    'font/ttf',
    'font/otf', 
    'application/font-woff',
    'application/font-woff2',
    'font/woff',
    'font/woff2'
  ];
  
  const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Font file must be smaller than 5MB' };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Only TTF, OTF, WOFF, and WOFF2 files are allowed' };
  }
  
  return { isValid: true };
};

// Get font format from file
export const getFontFormat = (fileName: string): 'ttf' | 'otf' | 'woff' | 'woff2' => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.') + 1);
  return extension as 'ttf' | 'otf' | 'woff' | 'woff2';
};

// Generate font family name from file name
export const generateFontFamily = (fileName: string): string => {
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  return nameWithoutExt
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Create font face CSS
export const createFontFaceCSS = (fontFamily: string, fontPath: string): string => {
  return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${fontPath}');
  font-display: swap;
}
  `.trim();
};

// Load font into document
export const loadFontIntoDocument = (fontFamily: string, fontPath: string): void => {
  const style = document.createElement('style');
  style.textContent = createFontFaceCSS(fontFamily, fontPath);
  document.head.appendChild(style);
};

// Note: File upload is now handled by the API service (FontAPI.uploadFontFile)
// This utility now focuses on validation and font processing only
