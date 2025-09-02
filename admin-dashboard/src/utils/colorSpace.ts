// Color space conversion utilities for Adobe RGB to sRGB conversion

export type ColorSpace = 'sRGB' | 'Adobe RGB';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert Adobe RGB to XYZ color space
 */
function adobeRGBToXYZ(r: number, g: number, b: number): { x: number; y: number; z: number } {
  // Normalize to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Apply Adobe RGB gamma correction (gamma = 2.19921875)
  const rLinear = Math.pow(rNorm, 2.19921875);
  const gLinear = Math.pow(gNorm, 2.19921875);
  const bLinear = Math.pow(bNorm, 2.19921875);

  // Adobe RGB to XYZ matrix transformation
  const x = rLinear * 0.5767309 + gLinear * 0.1855540 + bLinear * 0.1881852;
  const y = rLinear * 0.2973769 + gLinear * 0.6273491 + bLinear * 0.0752741;
  const z = rLinear * 0.0270343 + gLinear * 0.0706872 + bLinear * 0.9911085;

  return { x, y, z };
}

/**
 * Convert XYZ to sRGB color space
 */
function xyzToSRGB(x: number, y: number, z: number): RGBColor {
  // XYZ to sRGB matrix transformation
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

  // Apply sRGB gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  // Clamp to 0-1 range and convert to 0-255
  r = Math.max(0, Math.min(1, r)) * 255;
  g = Math.max(0, Math.min(1, g)) * 255;
  b = Math.max(0, Math.min(1, b)) * 255;

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

/**
 * Convert sRGB to XYZ color space
 */
function sRGBToXYZ(r: number, g: number, b: number): { x: number; y: number; z: number } {
  // Normalize to 0-1 range
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  // Apply sRGB gamma correction
  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  // sRGB to XYZ matrix transformation
  const x = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
  const y = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
  const z = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 0.9505;

  return { x, y, z };
}

/**
 * Convert XYZ to Adobe RGB color space
 */
function xyzToAdobeRGB(x: number, y: number, z: number): RGBColor {
  // XYZ to Adobe RGB matrix transformation
  let r = x * 2.0413690 + y * -0.5649464 + z * -0.3446944;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0134474 + y * -0.1183897 + z * 1.0154096;

  // Apply Adobe RGB gamma correction (gamma = 2.19921875)
  r = Math.pow(Math.max(0, r), 1 / 2.19921875);
  g = Math.pow(Math.max(0, g), 1 / 2.19921875);
  b = Math.pow(Math.max(0, b), 1 / 2.19921875);

  // Convert to 0-255 range
  r = Math.max(0, Math.min(1, r)) * 255;
  g = Math.max(0, Math.min(1, g)) * 255;
  b = Math.max(0, Math.min(1, b)) * 255;

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
}

/**
 * Convert Adobe RGB values to sRGB for web display
 */
export function adobeRGBToSRGB(r: number, g: number, b: number): RGBColor {
  const xyz = adobeRGBToXYZ(r, g, b);
  return xyzToSRGB(xyz.x, xyz.y, xyz.z);
}

/**
 * Convert sRGB values to Adobe RGB
 */
export function sRGBToAdobeRGB(r: number, g: number, b: number): RGBColor {
  const xyz = sRGBToXYZ(r, g, b);
  return xyzToAdobeRGB(xyz.x, xyz.y, xyz.z);
}

/**
 * Convert color between color spaces
 */
export function convertColor(
  r: number, 
  g: number, 
  b: number, 
  fromSpace: ColorSpace, 
  toSpace: ColorSpace
): RGBColor {
  if (fromSpace === toSpace) {
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }

  if (fromSpace === 'Adobe RGB' && toSpace === 'sRGB') {
    return adobeRGBToSRGB(r, g, b);
  }

  if (fromSpace === 'sRGB' && toSpace === 'Adobe RGB') {
    return sRGBToAdobeRGB(r, g, b);
  }

  // Default: return original values
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

/**
 * Get CSS color string from RGB values, converting from specified color space to sRGB
 */
export function getCSSColor(r: number, g: number, b: number, colorSpace: ColorSpace = 'sRGB'): string {
  const srgbColor = convertColor(r, g, b, colorSpace, 'sRGB');
  return `rgb(${srgbColor.r}, ${srgbColor.g}, ${srgbColor.b})`;
}

/**
 * Get hex color string from RGB values, converting from specified color space to sRGB
 */
export function getHexColor(r: number, g: number, b: number, colorSpace: ColorSpace = 'sRGB'): string {
  const srgbColor = convertColor(r, g, b, colorSpace, 'sRGB');
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(srgbColor.r)}${toHex(srgbColor.g)}${toHex(srgbColor.b)}`;
}
