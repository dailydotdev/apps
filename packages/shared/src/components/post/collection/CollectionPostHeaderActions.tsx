import React, { ReactElement } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { Origin } from '../../../lib/analytics';
import { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';
import { CollectionSubscribeButton } from './CollectionSubscribeButton';

const Container = classed('div', 'flex flex-row items-center');

export const CollectionPostHeaderActions = ({
  onShare,
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
        onShare={onShare}
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
