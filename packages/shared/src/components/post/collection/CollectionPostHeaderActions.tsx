import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import classed from '../../../lib/classed';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';
import SettingsContext from '../../../contexts/SettingsContext';
import { Origin } from '../../../lib/analytics';
import BellIcon from '../../icons/Bell';
import { PostHeaderActionsProps } from '../common';
import { PostMenuOptions } from '../PostMenuOptions';

const Container = classed('div', 'flex flex-row items-center');

const CollectionPostHeaderActions = ({
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
  const { openNewTab } = useContext(SettingsContext);

  return (
    <Container {...props} className={classNames('gap-2', className)}>
      <SimpleTooltip
        placement="bottom"
        content="Subscribe"
        disabled={!inlineActions}
      >
        {/* TODO WT-1939-collections FIX ACTION ON THIS with useNotificationPreference */}
        <Button
          className="btn-primary"
          tag="a"
          href={post.sharedPost?.permalink ?? post.permalink}
          target={openNewTab ? '_blank' : '_self'}
          icon={<BellIcon />}
          onClick={() => {}}
          data-testid="collectionPostActionsSubscribe"
        >
          {!inlineActions && 'Subscribe'}
        </Button>
      </SimpleTooltip>
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

export default CollectionPostHeaderActions;
