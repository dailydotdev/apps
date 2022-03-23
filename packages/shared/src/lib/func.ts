export const nextTick = (): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve));
