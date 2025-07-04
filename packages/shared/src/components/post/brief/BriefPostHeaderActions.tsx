import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { Origin } from '../../../lib/log';
import type { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';

const Container = classed('div', 'flex flex-row items-center');

export const BriefPostHeaderActions = ({
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  isFixedNavigation,
  ...props
}: PostHeaderActionsProps): ReactElement => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const isEnlarged = isFixedNavigation || isLaptop;

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <PostMenuOptions
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        origin={Origin.BriefModal}
        isEnlarged={isEnlarged}
      />
    </Container>
  );
};
