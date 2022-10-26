export const getTagPageLink = (tag: string): string =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${encodeURIComponent(tag)}`;

const previewDeployments = [
  'https://preview.app.daily.dev',
  'https://preview.app.daily.dev',
];

export const checkIsPreviewDeployment = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return previewDeployments.includes(window.location.origin);
};
