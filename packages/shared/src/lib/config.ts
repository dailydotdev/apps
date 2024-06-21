export const apiUrl =
  typeof window === 'undefined' ||
  process.env.NODE_ENV === 'test' ||
  process.env.TARGET_BROWSER
    ? process.env.NEXT_PUBLIC_API_URL
    : '/api';

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
export const PUBLIC_SQUAD_REQUEST_COOLDOWN = 14;
export const PUBLIC_SQUAD_REQUEST_REQUIREMENT = 5;
