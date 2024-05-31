export const apiUrl =
  typeof window === 'undefined' ||
  process.env.NODE_ENV === 'test' ||
  process.env.TARGET_BROWSER
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://daily-now-res.cloudinary.com/image/upload/f_auto/v1664367305/placeholders/placeholder3',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
export const PUBLIC_SQUAD_REQUEST_COOLDOWN = 14;
