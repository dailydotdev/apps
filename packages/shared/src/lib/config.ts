export const apiUrl =
  typeof window === 'undefined' ||
  process.env.NODE_ENV === 'test' ||
  process.env.TARGET_BROWSER
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const fallbackImages = {
  avatar:
    'https://daily-now-res.cloudinary.com/image/upload/t_logo,f_auto/v1635938111/logos/placeholder2',
};
