export const getTemplatedTitle = (
  title: string,
  template = '| daily.dev',
): string => `${title} ${template}`;
