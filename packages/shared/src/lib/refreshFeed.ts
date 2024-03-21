let shouldRefreshFeed = false;

export const setShouldRefreshFeed = (value: boolean): void => {
  shouldRefreshFeed = value;
};

export const getShouldRefreshFeed = (): boolean => {
  return shouldRefreshFeed;
};
