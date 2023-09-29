import React, { useCallback, useMemo } from 'react';
import { useGrowthBook } from '@growthbook/growthbook-react';
import { FeedPostClick } from './feed/useFeedOnPostClick';
import { Post } from '../graphql/posts';
import { feature } from '../lib/featureManagement';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { useExtensionPermission } from './useExtensionPermission';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import { useContentScriptStatus } from './useContentScriptStatus';
import { checkIsExtension } from '../lib/func';

type CompanionTriggerProps = {
  post: Post;
  index?: number;
  row?: number;
  column?: number;
};

type OpenArticle = (data?: CompanionTriggerProps) => () => Promise<void>;

export type CompanionTrigger = {
  onFeedArticleClick: FeedPostClick;
  onPostArticleClick: PostClick;
};

type PostClick = (e: React.MouseEvent, data: { post: Post }) => Promise<void>;

export default function useCompanionTrigger(
  customPostClickHandler: (
    post: Post,
    index?: number,
    row?: number,
    column?: number,
  ) => Promise<void>,
): CompanionTrigger {
  const isExtension = checkIsExtension();
  const { trackEvent } = useAnalyticsContext();
  const { closeModal: closeLazyModal, openModal: openLazyModal } =
    useLazyModal();
  const { checkHasCompleted, completeAction } = useActions();
  const gb = useGrowthBook();

  const featureEnabled = useMemo(() => {
    // gb.isOn triggers enrollment in the experiment
    // to avoid noise in the data, only call this if we are in the extension
    if (isExtension) {
      return gb.isOn(feature.engagementLoopJuly2023Companion.id);
    }

    return false;
  }, [gb, isExtension]);

  const { requestContentScripts } = useExtensionPermission();
  const { contentScriptGranted } = useContentScriptStatus();
  const alreadyCompleted = checkHasCompleted(
    ActionType.EngagementLoopJuly2023CompanionModal,
  );

  const handleCompleteAction = useCallback(() => {
    completeAction(ActionType.EngagementLoopJuly2023CompanionModal);
  }, [completeAction]);

  const closeModal = useCallback(() => {
    closeLazyModal();
  }, [closeLazyModal]);

  const openArticle: OpenArticle = useCallback(
    (data: CompanionTriggerProps) => async (redirectUrl?: string) => {
      await customPostClickHandler(
        data.post,
        data.index,
        data.row,
        data.column,
      );

      if (redirectUrl) {
        window.open(redirectUrl, '_blank');
      }

      closeModal();
    },
    [customPostClickHandler, closeModal],
  );

  const activateCompanion = useCallback(
    (data) => async (redirectUrl?: string) => {
      await requestContentScripts({
        origin: 'companion modal permission button',
        skipRedirect: true,
      });

      await customPostClickHandler(
        data.post,
        data.index,
        data.row,
        data.column,
      );

      if (redirectUrl) {
        window.open(redirectUrl, '_blank');
      }

      closeModal();
    },
    [requestContentScripts, customPostClickHandler, closeModal],
  );

  const openModal = useCallback(
    (data?: CompanionTriggerProps) => {
      openLazyModal({
        type: LazyModal.CompanionModal,
        props: {
          url: data?.post?.permalink,
          onReadArticleClick: openArticle(data),
          onActivateCompanion: activateCompanion(data),
          onAfterClose() {
            handleCompleteAction();

            trackEvent({
              event_name: AnalyticsEvent.CloseCompanionPermissionModal,
              extra: JSON.stringify({ origin: Origin.Auto }),
            });
          },
        },
      });

      trackEvent({
        event_name: AnalyticsEvent.OpenCompanionPermissionModal,
        extra: JSON.stringify({ origin: Origin.Auto }),
      });
    },
    [
      openArticle,
      activateCompanion,
      openLazyModal,
      trackEvent,
      handleCompleteAction,
    ],
  );

  const shouldOpenArticle = useMemo(() => {
    return (
      !isExtension ||
      !featureEnabled ||
      alreadyCompleted ||
      contentScriptGranted
    );
  }, [alreadyCompleted, isExtension, featureEnabled, contentScriptGranted]);

  const articleClickHandler = useCallback(
    async (
      e: React.MouseEvent,
      { post, index, row, column }: Partial<CompanionTriggerProps> = {},
    ) => {
      if (shouldOpenArticle) {
        await customPostClickHandler(post, index, row, column);
      } else {
        e.preventDefault();
        openModal({ post, index, row, column });
      }
    },

    [shouldOpenArticle, customPostClickHandler, openModal],
  );

  const onFeedArticleClick = useCallback<FeedPostClick>(
    async (post, index, row, column, { clickEvent }) => {
      await articleClickHandler(clickEvent, { post, index, row, column });
    },
    [articleClickHandler],
  );

  const onPostArticleClick = useCallback<PostClick>(
    async (e, { post }) => {
      await articleClickHandler(e, { post });
    },
    [articleClickHandler],
  );

  return {
    onFeedArticleClick,
    onPostArticleClick,
  };
}
