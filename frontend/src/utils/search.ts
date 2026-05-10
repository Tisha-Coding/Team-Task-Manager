// Unified search utility for consistent behavior across the app
export const searchMatch = (
  haystack: string | null | undefined,
  needle: string,
): boolean => {
  if (!haystack || !needle) return !needle; // empty search matches everything
  return haystack.toLowerCase().startsWith(needle.toLowerCase());
};

// For multi-field search (OR logic)
export const searchFields = (
  needle: string,
  ...fields: (string | null | undefined)[]
): boolean => {
  if (!needle) return true; // empty search matches everything
  const q = needle.toLowerCase();
  return fields.some((field) => field?.toLowerCase().startsWith(q));
};
