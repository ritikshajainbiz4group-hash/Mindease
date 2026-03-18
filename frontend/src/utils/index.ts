export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isEmptyString = (value: string): boolean => value.trim().length === 0;

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

/**
 * Lazily require a heavy native module only when it is actually needed.
 * Follows the react_native_rules lazy loading pattern.
 *
 * @example
 *   const picker = lazyRequire<typeof import('expo-image-picker')>('expo-image-picker');
 *   const result = await picker().launchImageLibraryAsync();
 */
export function lazyRequire<T>(moduleName: string): () => T {
  let mod: T | null = null;
  return () => {
    if (!mod) {
      mod = require(moduleName) as T;
    }
    return mod;
  };
}
