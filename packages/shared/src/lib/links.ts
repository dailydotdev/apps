import { isDevelopment } from './constants';

export const getTagPageLink = (tag: string): string =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${encodeURIComponent(tag)}`;

export const isPreviewDeployment = (() => {
  const value = process.env.NEXT_PUBLIC_PREVIEW_DEPLOYMENT;

  if (isDevelopment) {
    return true;
  }

  if (!value) {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return !!value;
})();
