export const apiUrl =
  typeof window === 'undefined' ||
  process.env.NODE_ENV === 'test' ||
  process.env.TARGET_BROWSER
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';
