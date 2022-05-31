export const nextTick = (): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve));

export const isNullOrUndefined = (param: unknown): boolean =>
  typeof param === 'undefined' || param === null;
