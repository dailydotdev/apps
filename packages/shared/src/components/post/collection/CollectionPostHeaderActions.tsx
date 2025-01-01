import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { Origin } from '../../../lib/log';
import type { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';
import { CollectionSubscribeButton } from './CollectionSubscribeButton';

const Container = classed('div', 'flex flex-row items-center');

export const CollectionPostHeaderActions = ({
  post,
  onClose,
  inlineActions,
  className,
  notificationClassName,
  contextMenuId,
  onRemovePost,
  ...props
}: PostHeaderActionsProps): ReactElement => {
  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <CollectionSubscribeButton post={post} />
      <PostMenuOptions
        post={post}
        onClose={onClose}
        inlineActions={inlineActions}
        contextMenuId={contextMenuId}
        onRemovePost={onRemovePost}
        origin={Origin.CollectionModal}
      />
    </Container>
  );
};
