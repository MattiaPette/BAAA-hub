import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '../url';

describe('normalizeUrl', () => {
  it('should remove single trailing slash', () => {
    expect(normalizeUrl('http://localhost:8180/')).toBe(
      'http://localhost:8180',
    );
  });

  it('should remove multiple trailing slashes', () => {
    expect(normalizeUrl('http://localhost:8180///')).toBe(
      'http://localhost:8180',
    );
  });

  it('should not modify URL without trailing slash', () => {
    expect(normalizeUrl('http://localhost:8180')).toBe('http://localhost:8180');
  });

  it('should preserve path segments', () => {
    expect(normalizeUrl('http://localhost:8180/path/to/resource/')).toBe(
      'http://localhost:8180/path/to/resource',
    );
  });

  it('should handle HTTPS URLs', () => {
    expect(normalizeUrl('https://keycloak.example.com/')).toBe(
      'https://keycloak.example.com',
    );
  });

  it('should handle URLs with ports', () => {
    expect(normalizeUrl('http://localhost:8080/')).toBe(
      'http://localhost:8080',
    );
  });

  it('should handle empty string', () => {
    expect(normalizeUrl('')).toBe('');
  });

  it('should handle single slash', () => {
    expect(normalizeUrl('/')).toBe('');
  });
});
