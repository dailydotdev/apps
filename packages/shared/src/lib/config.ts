export const isLocalhost = process.env.NEXT_PUBLIC_DOMAIN === 'localhost';

// in gitpod, we need to call the API through the proxy rewrite to avoid CORS issues
// but when window is undefined, it means server-side request so we need to call api directly
const shouldCallProxyRewrite =
  process.env.NEXT_PUBLIC_DOMAIN === 'localhost' &&
  typeof window !== 'undefined';

export const apiUrl = shouldCallProxyRewrite
  ? '/api'
  : process.env.NEXT_PUBLIC_API_URL;

export const graphqlUrl = `${apiUrl}/graphql`;

export const fallbackImages = {
  avatar:
    'https://media.daily.dev/image/upload/s--qsFuKGv_--/t_logo,f_auto/public/noProfile',
  company:
    'https://media.daily.dev/image/upload/s--9Eda7mil--/t_logo,f_auto/v1766043047/placeholders/Image_noOrg',
};

export const MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP = 3;
export const MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE = 1;
