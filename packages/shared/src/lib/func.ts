export const nextTick = (): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve));

export const safeJsonParse = <T = unknown>(data: string): T | string => {
  try {
    return JSON.parse(data);
  } catch (ex) {
    return data;
  }
};
