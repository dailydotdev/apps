export const isLocalhost = process.env.NEXT_PUBLIC_DOMAIN === 'localhost';

// For server-side requests, use direct API URL to bypass Next.js rewrites
// For client-side requests, use /api which gets rewritten by Next.js
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Server-side: direct API
  }

  return isLocalhost ? '/api' : process.env.NEXT_PUBLIC_API_URL; // Client-side: proxy
};

export const apiUrl = getApiUrl();

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
