import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PageWidgets } from '../../utilities';
import { ShareMobile } from '../../ShareMobile';
import ShareBar from '../../ShareBar';
import { PostOrigin } from '../../../hooks/analytics/useAnalyticsContextData';
import CollectionPostHeaderActions from './CollectionPostHeaderActions';
import { Button, ButtonSize } from '../../buttons/Button';
import XIcon from '../../icons/MiniClose';
import AlertBanner from '../../alert/AlertBanner';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { PostHeaderActionsProps } from '../common';

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
  const { completeAction, checkHasCompleted } = useActions();
  const shouldShowAlert = !checkHasCompleted(ActionType.CollectionsIntro);

  return (
    <PageWidgets className={className}>
      <CollectionPostHeaderActions
        onShare={onShare}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      {shouldShowAlert && (
        <AlertBanner
          className={{
            container: classNames(
              'hidden laptop:block mt-6 border-theme-status-cabbage !rounded-16 !p-3 typo-callout',
              className,
            ),
          }}
        >
          <div>
            <b>Introducing Collections!</b>
            <br />
            Collections are posts that aggregate all the information about
            specific news to help you save time and discuss with the community.
          </div>
          <Button
            data-testid="alert-close"
            onClick={() => completeAction(ActionType.CollectionsIntro)}
            icon={<XIcon />}
            buttonSize={ButtonSize.XSmall}
            iconOnly
            style={{ position: 'absolute' }}
            className="top-2 right-2 btn-tertiary"
          />
        </AlertBanner>
      )}

      {/* TODO: SOURCES - SOME PARTS OF DESIGN CAN BE TAKEN FROM THE FURTHER READING COMPONENT */}
      {/* <FurtherReading currentPost={post} /> */}
      <ShareBar post={post} />
      <ShareMobile post={post} share={onShare} link={post.commentsPermalink} />
    </PageWidgets>
  );
};

export default CollectionPostWidgets;
