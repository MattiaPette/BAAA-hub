/**
 * Normalize a URL by removing trailing slashes
 * This prevents double slashes when concatenating URL paths
 *
 * @param url - The URL to normalize
 * @returns The normalized URL without trailing slashes
 *
 * @example
 * ```typescript
 * normalizeUrl('http://localhost:8180/') // 'http://localhost:8180'
 * normalizeUrl('http://localhost:8180') // 'http://localhost:8180'
 * normalizeUrl('http://localhost:8180///') // 'http://localhost:8180'
 * ```
 */
export const normalizeUrl = (url: string): string => {
  return url.replace(/\/+$/, '');
};
