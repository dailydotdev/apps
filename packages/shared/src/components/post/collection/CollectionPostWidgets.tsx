import React, { ReactElement } from 'react';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import FurtherReading from '../../widgets/FurtherReading';
import { PostHeaderActionsProps } from '../PostHeaderActions';
import { PostOrigin } from '../../../hooks/analytics/useAnalyticsContextData';
import CollectionPostHeaderActions from './CollectionPostHeaderActions';
import { WidgetContainer } from '../../widgets/common';
import { Button, ButtonSize } from '../../buttons/Button';
import XIcon from '../../icons/MiniClose';

interface PostWidgetsProps
  extends Omit<PostHeaderActionsProps, 'contextMenuId'> {
  origin?: PostOrigin;
}

const CollectionPostWidgets = ({
  onShare,
  post,
  className,
  onClose,
}: PostWidgetsProps): ReactElement => {
  return (
    <PageWidgets className={className}>
      <CollectionPostHeaderActions
        onShare={onShare}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      {/* TODO: CHECK MAYBE ALERT COMPONENTS NEEDS TO BE USED HERE - BUT THE ONE THERE IS WITH A POINTER - MIGHT NEED TO MODIFY */}
      <WidgetContainer className="hidden laptop:flex relative flex-col p-3 pr-11 border-theme-status-cabbage typo-callout">
        <div>
          <b>Introducing Collections!</b>
          <br />
          Collections are posts that aggregate all the information about
          specific news to help you save time and discuss with the community.
        </div>
        <Button
          data-testid="alert-close"
          onClick={() => {}}
          icon={<XIcon />}
          buttonSize={ButtonSize.XSmall}
          iconOnly
          style={{ position: 'absolute' }}
          className="top-2 right-2 btn-tertiary"
        />
      </WidgetContainer>
      {/* TODO: SOURCES - SOME PARTS OF DESIGN CAN BE TAKEN FROM THE FURTHER READING COMPONENT */}
      {/* <FurtherReading currentPost={post} /> */}
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
    </PageWidgets>
  );
};

export default CollectionPostWidgets;
