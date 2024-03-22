import { describe, expect, it } from 'vitest';
import { capitalizeInitials } from './capitalize-initials';

describe('capitalizeInitials function', () => {
  it('should capitalize the initials of each word in a string', () => {
    const input = 'hello world';
    const expectedOutput = 'Hello World';

    expect(capitalizeInitials(input)).toBe(expectedOutput);
  });

  it('should handle empty string input', () => {
    const input = '';
    const expectedOutput = '';

    expect(capitalizeInitials(input)).toBe(expectedOutput);
  });

  it('should handle input with single word', () => {
    const input = 'test';
    const expectedOutput = 'Test';

    expect(capitalizeInitials(input)).toBe(expectedOutput);
  });

  it('should handle input with multiple spaces between words', () => {
    const input = '   multiple    spaces    ';
    const expectedOutput = '   Multiple    Spaces    ';

    expect(capitalizeInitials(input)).toBe(expectedOutput);
  });
});
