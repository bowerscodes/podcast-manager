import { formatDate, formatDateTime } from '@/lib/date-utils';

describe('Date Utils', () => {
  // Mock navigator.language for consistent testing
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator mock before each test
    Object.defineProperty(global, 'navigator', {
      value: {
        language: 'en-GB'
      },
      writable: true
    });
  });

  afterAll(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });

  describe('formatDate', () => {
    it('should format date string in GB format by default', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('15/01/2024');
    });

    it('should format Date object in GB format by default', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('15/01/2024');
    });

    it('should use US format when navigator.language is en-US', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US'
        },
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('01/15/2024');
    });

    it('should default to GB format for other locales', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'fr-FR'
        },
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('15/01/2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });

    it('should handle edge cases', () => {
      // Test leap year
      const leapYear = '2024-02-29T00:00:00Z';
      const result = formatDate(leapYear);
      expect(result).toBe('29/02/2024');

      // Test end of year
      const endOfYear = '2024-12-31T23:59:59Z';
      const result2 = formatDate(endOfYear);
      expect(result2).toBe('31/12/2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time in GB format by default', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      // Note: The exact format may vary based on timezone, so we check for key components
      expect(result).toContain('15/01/2024');
      expect(result).toMatch(/\d{2}:\d{2}/); // Should contain time in HH:MM format
    });

    it('should format Date object with time in GB format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('15/01/2024');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should use US format when navigator.language is en-US', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'en-US'
        },
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      expect(result).toContain('01/15/2024');
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/); // US format includes AM/PM
    });

    it('should default to GB format for other locales', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          language: 'de-DE'
        },
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      expect(result).toContain('15/01/2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDateTime('invalid-date');
      expect(result).toBe('Invalid Date');
    });

    it('should handle different times correctly', () => {
      // Test midnight
      const midnight = '2024-01-15T00:00:00Z';
      const result1 = formatDateTime(midnight);
      expect(result1).toContain('15/01/2024');
      
      // Test noon
      const noon = '2024-01-15T12:00:00Z';
      const result2 = formatDateTime(noon);
      expect(result2).toContain('15/01/2024');
    });
  });

  describe('navigator fallback', () => {
    it('should handle missing navigator.language', () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('15/01/2024'); // Should default to GB format
    });

    it('should handle undefined navigator', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true
      });

      const date = '2024-01-15T10:30:00Z';
      // This might throw an error or fallback gracefully
      // The function should handle this case
      expect(() => formatDate(date)).not.toThrow();
    });
  });
});
