import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
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
import AlertBanner from '../../alert/AlertBanner';
import AlertContext from '../../../contexts/AlertContext';

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
  const { alerts, updateAlerts } = useContext(AlertContext);

  return (
    <PageWidgets className={className}>
      <CollectionPostHeaderActions
        onShare={onShare}
        post={post}
        onClose={onClose}
        className="hidden tablet:flex pt-6"
        contextMenuId="post-widgets-context"
      />
      {/* TODO: Is this really an alert, didn't see this in the DR but from the design looked so, but needs to be checked. */}
      {alerts.introducingCollections && (
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
            onClick={() => updateAlerts({ introducingCollections: false })}
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
