export const nextTick = (): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve));

export const parseOrDefault = <T = unknown>(data: string): T | string => {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return data;
  }
};

export const isNullOrUndefined = (param: unknown): boolean =>
  typeof param === 'undefined' || param === null;

export const disabledRefetch = {
  refetchIntervalInBackground: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
};

Object.freeze(disabledRefetch);
