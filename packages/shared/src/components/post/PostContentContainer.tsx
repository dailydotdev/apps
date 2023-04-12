import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';

interface PostContentContainerProps {
  hasNavigation?: boolean;
  className?: string;
  children: ReactNode;
}

const BodyContainer = classed('div', 'flex flex-col w-full pb-6');

const PageBodyContainer = classed(
  BodyContainer,
  'm-auto w-full laptop:border-l laptop:border-theme-divider-tertiary',
);

function PostContentContainer({
  hasNavigation,
  className,
  children,
}: PostContentContainerProps): ReactElement {
  const Wrapper = hasNavigation ? BodyContainer : PageBodyContainer;

  return <Wrapper className={className}>{children}</Wrapper>;
}

export default PostContentContainer;
