export const removeLinkTargetElement = (link: string): string => {
  const { origin, pathname, search } = new URL(link);

  return origin + pathname + search;
};

export const capitalize = (value: string): string =>
  (value && value[0].toUpperCase() + value.slice(1)) || '';

export const anchorDefaultRel = 'noopener noreferrer';
