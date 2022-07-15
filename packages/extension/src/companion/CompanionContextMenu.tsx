import React, { ReactElement, useContext, useState } from 'react';
import CommentIcon from '@dailydotdev/shared/src/components/icons/Discuss';
import ShareIcon from '@dailydotdev/shared/src/components/icons/Share';
import FlagIcon from '@dailydotdev/shared/src/components/icons/Flag';
import FeedbackIcon from '@dailydotdev/shared/src/components/icons/Feedback';
import EyeIcon from '@dailydotdev/shared/src/components/icons/Eye';
import { Item, Menu } from '@dailydotdev/react-contexify';
import RepostPostModal from '@dailydotdev/shared/src/components/modals/ReportPostModal';
import { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { postAnalyticsEvent } from '@dailydotdev/shared/src/lib/feed';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import BookmarkIcon from '@dailydotdev/shared/src/components/icons/Bookmark';
import { OnShareOrBookmarkProps } from '@dailydotdev/shared/src/components/post/PostActions';
import { AdditionalInteractionButtons } from '@dailydotdev/shared/src/lib/featureValues';
import { getCompanionWrapper } from './common';
import DisableCompanionModal from './DisableCompanionModal';

interface CompanionContextMenuProps extends OnShareOrBookmarkProps {
  postData: PostBootData;
  additionalInteractionButtonFeature: string;
  onReport: (T) => void;
  onBlockSource: (T) => void;
  onDisableCompanion: () => void;
}

export default function CompanionContextMenu({
  postData,
  additionalInteractionButtonFeature,
  onReport,
  onBlockSource,
  onDisableCompanion,
  onBookmark,
  onShare,
}: CompanionContextMenuProps): ReactElement {
  const { displayToast } = useToastNotification();
  const { trackEvent } = useContext(AnalyticsContext);
  const [reportModal, setReportModal] = useState<boolean>();
  const [disableModal, setDisableModal] = useState<boolean>();

  const onReportPost = async (
    reportPostIndex,
    reportedPost,
    reason,
    comment,
    blockSource,
  ): Promise<void> => {
    onReport({ id: reportedPost.id, reason, comment });
    if (blockSource) {
      onBlockSource({ id: reportedPost?.source?.id });
    }

    trackEvent(
      postAnalyticsEvent('report post', reportedPost, {
        extra: { origin: 'companion context menu' },
      }),
    );

    displayToast('🚨 Thanks for reporting!');
  };

  return (
    <>
      <Menu
        disableBoundariesCheck
        id="companion-options-context"
        className="menu-primary"
        animation="fade"
      >
        <Item>
          <a
            className="flex items-center w-full"
            href={postData?.commentsPermalink}
          >
            <CommentIcon size="medium" className="mr-2" /> View discussion
          </a>
        </Item>
        {additionalInteractionButtonFeature ===
        AdditionalInteractionButtons.Bookmark ? (
          <Item onClick={onShare}>
            <ShareIcon size="medium" className="mr-2" /> Share article via...
          </Item>
        ) : (
          <Item onClick={onBookmark}>
            <BookmarkIcon
              size="medium"
              className="mr-2"
              secondary={postData?.bookmarked}
            />
            {postData?.bookmarked ? 'Remove from' : 'Save to'} bookmarks
          </Item>
        )}
        <Item onClick={() => setReportModal(true)}>
          <FlagIcon size="medium" className="mr-2" /> Report
        </Item>
        <Item>
          <a
            className="flex items-center w-full"
            href="https://daily.dev/feedback"
            target="_blank"
          >
            <FeedbackIcon size="medium" className="mr-2" /> Give us feedback
          </a>
        </Item>
        <Item onClick={() => setDisableModal(true)}>
          <EyeIcon size="medium" className="mr-2" /> Disable widget
        </Item>
      </Menu>
      {reportModal && (
        <RepostPostModal
          className="z-rank"
          post={postData}
          parentSelector={getCompanionWrapper}
          isOpen={!!reportModal}
          postIndex={1}
          onReport={onReportPost}
          onRequestClose={() => setReportModal(null)}
        />
      )}
      {disableModal && (
        <DisableCompanionModal
          onConfirm={onDisableCompanion}
          isOpen={!!disableModal}
          onRequestClose={() => setDisableModal(null)}
          parentSelector={getCompanionWrapper}
        />
      )}
    </>
  );
}
