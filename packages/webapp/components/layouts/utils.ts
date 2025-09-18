export const getTemplatedTitle = (
  title: string,
  template = '| daily.dev',
): string => `${title} ${template}`;

export const opportunityPageLayoutProps = {
  className: 'gap-10 laptop:!pt-10 pb-10',
  screenCentered: true,
};
