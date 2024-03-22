import { describe, expect, it } from 'vitest';
import { calculateBoundingBox } from './calculate-bounding-box';

function roundTo6DecimalPlaces(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

describe('calculateBoundingBox function', () => {
  it('Calculates bounding box correctly for New York City', () => {
    const result = calculateBoundingBox({
      lat: 40.7128,
      lng: -74.006,
      maxDistance: 10000, // 10km
    });

    const resultWith6Decimal = {
      minLat: roundTo6DecimalPlaces(result.minLat),
      maxLat: roundTo6DecimalPlaces(result.maxLat),
      minLng: roundTo6DecimalPlaces(result.minLng),
      maxLng: roundTo6DecimalPlaces(result.maxLng),
    };

    const expectedResult = {
      maxLat: 40.802793,
      maxLng: -73.679391,
      minLat: 40.622807,
      minLng: -74.332609,
    };

    Object.keys(expectedResult).forEach((key) =>
      expect(resultWith6Decimal[key]).toBe(expectedResult[key]),
    );
  });

  it('Calculates bounding box correctly for San Francisco', () => {
    const result = calculateBoundingBox({
      lat: 37.7749,
      lng: -122.4194,
      maxDistance: 5000, // 5km
    });

    const resultWith6Decimal = {
      minLat: roundTo6DecimalPlaces(result.minLat),
      maxLat: roundTo6DecimalPlaces(result.maxLat),
      minLng: roundTo6DecimalPlaces(result.minLng),
      maxLng: roundTo6DecimalPlaces(result.maxLng),
    };

    const expectedResult = {
      maxLat: 37.819896,
      maxLng: -122.335469,
      minLat: 37.729904,
      minLng: -122.503331,
    };

    Object.keys(expectedResult).forEach((key) =>
      expect(resultWith6Decimal[key]).toBe(expectedResult[key]),
    );
  });
});
