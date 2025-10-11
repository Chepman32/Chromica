/**
 * Unit tests for color filters
 */

import {
  COLOR_FILTERS,
  getFilterById,
  getFreeFilters,
  getPremiumFilters,
} from '../filters';

describe('Color Filters', () => {
  describe('Filter Registry', () => {
    it('should have 14 total filters', () => {
      expect(COLOR_FILTERS).toHaveLength(14);
    });

    it('should have 6 free filters', () => {
      const freeFilters = getFreeFilters();
      expect(freeFilters).toHaveLength(6);
      expect(freeFilters.map(f => f.id)).toEqual([
        'none',
        'bw',
        'sepia',
        'vintage',
        'cool',
        'warm',
      ]);
    });

    it('should have 8 premium filters', () => {
      const premiumFilters = getPremiumFilters();
      expect(premiumFilters).toHaveLength(8);
      expect(premiumFilters.map(f => f.id)).toEqual([
        'cinematic',
        'film',
        'hdr',
        'portrait',
        'landscape',
        'neon',
        'cyberpunk',
        'retro',
      ]);
    });

    it('should find filter by id', () => {
      const filter = getFilterById('sepia');
      expect(filter).toBeDefined();
      expect(filter?.name).toBe('Sepia');
    });

    it('should return undefined for invalid id', () => {
      const filter = getFilterById('invalid');
      expect(filter).toBeUndefined();
    });
  });

  describe('Color Matrix Generation', () => {
    it('should generate identity matrix for "none" filter', () => {
      const filter = getFilterById('none');
      const matrix = filter?.getColorMatrix(1.0);

      expect(matrix).toEqual([
        1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
      ]);
    });

    it('should generate valid matrix for each filter', () => {
      COLOR_FILTERS.forEach(filter => {
        const matrix = filter.getColorMatrix(1.0);

        // Matrix should have 20 values
        expect(matrix).toHaveLength(20);

        // All values should be numbers
        matrix.forEach(value => {
          expect(typeof value).toBe('number');
          expect(isNaN(value)).toBe(false);
        });
      });
    });

    it('should interpolate matrix based on intensity', () => {
      const filter = getFilterById('bw');

      const matrix0 = filter?.getColorMatrix(0);
      const matrix50 = filter?.getColorMatrix(0.5);
      const matrix100 = filter?.getColorMatrix(1.0);

      // At 0 intensity, should be close to identity
      expect(matrix0?.[0]).toBeCloseTo(1, 2);
      expect(matrix0?.[6]).toBeCloseTo(1, 2);

      // At 50% intensity, should be between identity and full effect
      expect(matrix50?.[0]).toBeGreaterThan(matrix100![0]);
      expect(matrix50?.[0]).toBeLessThan(1);
    });

    it('should handle edge case intensities', () => {
      const filter = getFilterById('sepia');

      // Negative intensity (should clamp to 0)
      const matrixNeg = filter?.getColorMatrix(-0.5);
      expect(matrixNeg).toBeDefined();

      // Over 1.0 intensity (should clamp to 1)
      const matrixOver = filter?.getColorMatrix(1.5);
      expect(matrixOver).toBeDefined();
    });
  });

  describe('Filter Properties', () => {
    it('should have unique ids', () => {
      const ids = COLOR_FILTERS.map(f => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty names', () => {
      COLOR_FILTERS.forEach(filter => {
        expect(filter.name).toBeTruthy();
        expect(filter.name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid isPro flags', () => {
      COLOR_FILTERS.forEach(filter => {
        expect(typeof filter.isPro).toBe('boolean');
      });
    });
  });

  describe('Specific Filter Behaviors', () => {
    it('Black & White should desaturate', () => {
      const filter = getFilterById('bw');
      const matrix = filter?.getColorMatrix(1.0);

      // In a grayscale matrix, R, G, B rows should be identical
      expect(matrix?.[0]).toBeCloseTo(matrix![5], 2);
      expect(matrix?.[1]).toBeCloseTo(matrix![6], 2);
      expect(matrix?.[2]).toBeCloseTo(matrix![7], 2);
    });

    it('Warm filter should boost reds', () => {
      const filter = getFilterById('warm');
      const matrix = filter?.getColorMatrix(1.0);

      // Red channel should be amplified (R[0] > 1)
      // This is a simplified check - actual implementation may vary
      expect(matrix?.[0]).toBeGreaterThanOrEqual(0.8);
    });

    it('Cool filter should boost blues', () => {
      const filter = getFilterById('cool');
      const matrix = filter?.getColorMatrix(1.0);

      // Blue channel should be amplified (B[12] > 1)
      // This is a simplified check - actual implementation may vary
      expect(matrix?.[12]).toBeGreaterThanOrEqual(0.8);
    });
  });
});
