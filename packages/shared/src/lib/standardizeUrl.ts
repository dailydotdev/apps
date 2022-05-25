const excludeFromStandardization = ['youtube.com'];

const isExcluded = (url: string) =>
  excludeFromStandardization.some((e) => url.includes(e));

const subtractDomain = (url: string): string => {
  const matches = url.match(
    /^(?:https?:\/\/)?(?:[^@/\n]+@)?(?:www\.)?([^:/?\n]+)/i,
  );
  return matches && matches[1];
};

const removeTrailingSlash = (url: string): string => url.replace(/\/$/, '');

export const standardizeURL = (url: string): string => {
  const domain = subtractDomain(url);
  if (!isExcluded(domain)) {
    return removeTrailingSlash(url.split('?')[0]);
  }

  return removeTrailingSlash(url);
};
