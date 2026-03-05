import { truncateAtWordBoundary } from '@dailydotdev/shared/src/lib/strings';

export const getTemplatedTitle = (
  title: string,
  template = '| daily.dev',
): string => {
  const maxTitleLength = 60;
  const suffix = ` ${template}`;
  const ellipsisLength = 3;

  if (title.length + suffix.length > maxTitleLength) {
    if (title.length > maxTitleLength) {
      return truncateAtWordBoundary(title, maxTitleLength - ellipsisLength);
    }

    return title;
  }

  return `${title}${suffix}`;
};

export const getPageSeoTitles = (
  title: string,
  template = '| daily.dev',
): { title: string; openGraph: { title: string } } => {
  const suffix = ` ${template}`;

  return {
    title: getTemplatedTitle(title, template),
    openGraph: {
      title: `${title}${suffix}`,
    },
  };
};

export const opportunityPageLayoutProps = {
  className: 'gap-10 laptop:!pt-10 pb-10',
  screenCentered: true,
};
