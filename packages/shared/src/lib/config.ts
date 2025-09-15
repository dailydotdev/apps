export const isLocalhost = process.env.NEXT_PUBLIC_DOMAIN === 'localhost';

const getApiUrl = () => {
  if (isLocalhost) {
    // For GitPod server-side requests, use direct API URL to bypass Next.js rewrites
    return typeof window === 'undefined' ? 'http://localhost:5000' : '/api';
  }

  return process.env.NEXT_PUBLIC_API_URL;
};

export const apiUrl = getApiUrl();

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
