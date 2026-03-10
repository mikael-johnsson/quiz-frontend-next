/**
 *
 * @param value a string or string array coming from the search params, or undefined if not present
 * @returns an array of strings, ensuring that even a single string is wrapped in an array, and undefined is returned as an empty array
 */
export function normalizeArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
