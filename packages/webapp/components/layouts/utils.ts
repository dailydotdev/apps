export const getTemplatedTitle = (
  title: string,
  template = '| daily.dev',
): string => {
  const maxTitleLength = 60;
  const suffix = ` ${template}`;

  if (title.length + suffix.length > maxTitleLength) {
    if (title.length > maxTitleLength) {
      return `${title.slice(0, maxTitleLength - 3)}...`;
    }

    return title;
  }

  return `${title}${suffix}`;
};

export const opportunityPageLayoutProps = {
  className: 'gap-10 laptop:!pt-10 pb-10',
  screenCentered: true,
};
