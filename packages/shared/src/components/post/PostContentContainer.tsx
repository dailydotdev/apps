import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import FixedPostNavigation from './FixedPostNavigation';
import { PostNavigationProps } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import { useViewSize, ViewSize } from '../../hooks';

interface PostContentContainerProps {
  hasNavigation?: boolean;
  className?: string;
  children: ReactNode;
  navigationProps?: PostNavigationProps;
  isNavigationOutside?: boolean;
}

const BodyContainer = classed(
  'div',
  'flex flex-col w-full pb-6 bg-background-default',
);

const PageBodyContainer = classed(
  BodyContainer,
  'm-auto w-full laptop:border-x laptop:border-border-subtlest-tertiary',
);

function PostContentContainer({
  hasNavigation,
  className,
  children,
  navigationProps,
  isNavigationOutside,
}: PostContentContainerProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const props = !isMobile && navigationProps;
  const Wrapper = hasNavigation ? BodyContainer : PageBodyContainer;

  return (
    <ConditionalWrapper
      condition={isNavigationOutside}
      wrapper={(component) => (
        <>
          {props && <FixedPostNavigation {...props} />}
          {component}
        </>
      )}
    >
      <Wrapper className={className}>
        {props && !isNavigationOutside && <FixedPostNavigation {...props} />}
        {children}
      </Wrapper>
    </ConditionalWrapper>
  );
}

export default PostContentContainer;
