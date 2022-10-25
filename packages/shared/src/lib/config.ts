import { isProduction } from './constants';

export const apiUrl =
  typeof window === 'undefined' || !isProduction || process.env.TARGET_BROWSER
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const fallbackImages = {
  avatar:
    'https://daily-now-res.cloudinary.com/image/upload/f_auto/v1664367305/placeholders/placeholder3',
};
