import React, { useCallback, useContext } from 'react';
import { useGrowthBook } from '@growthbook/growthbook-react';
import { FeedPostClick } from './feed/useFeedOnPostClick';
import { Post } from '../graphql/posts';
import { Features } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';

import { useExtensionPermission } from './useExtensionPermission';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

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
  const isExtension = process.env.TARGET_BROWSER;
  const { trackEvent } = useContext(AnalyticsContext);
  const { closeModal: closeLazyModal, openModal: openLazyModal } =
    useLazyModal();
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();
  const gb = useGrowthBook();

  const { requestContentScripts, useContentScriptStatus } =
    useExtensionPermission({
      origin: 'companion modal permission button',
    });

  const { contentScriptGranted } = useContentScriptStatus();
  const alreadyCompleted = checkHasCompleted(
    ActionType.EngagementLoopJuly2023CompanionModal,
  );

  const handleCompleteAction = useCallback(() => {
    if (isActionsFetched)
      completeAction(ActionType.EngagementLoopJuly2023CompanionModal);
  }, [isActionsFetched, completeAction]);

  const closeModal = useCallback(() => {
    closeLazyModal();
    handleCompleteAction();

    trackEvent({
      event_name: `close companion permission popup`,
      extra: JSON.stringify({ origin: 'automatic' }),
    });
  }, [closeLazyModal, handleCompleteAction, trackEvent]);

  const activateCompanion = useCallback(async () => {
    await requestContentScripts();
    closeModal();
    handleCompleteAction();
  }, [requestContentScripts, closeModal, handleCompleteAction]);

  const openArticle: OpenArticle = useCallback(
    (data) => async () => {
      await customPostClickHandler(
        data.post,
        data.index,
        data.row,
        data.column,
      );

      closeModal();
      handleCompleteAction();
    },
    [customPostClickHandler, closeModal, handleCompleteAction],
  );

  const openModal = useCallback(
    (data?: CompanionTriggerProps) => {
      openLazyModal({
        type: LazyModal.CompanionModal,
        props: {
          url: data?.post?.permalink,
          onReadArticleClick: openArticle(data),
          onActivateCompanion: activateCompanion,
        },
      });

      trackEvent({
        event_name: `open companion permission popup`,
        extra: JSON.stringify({ origin: 'automatic' }),
      });
    },
    [openArticle, activateCompanion, openLazyModal, trackEvent],
  );

  const articleClickHandler = useCallback(
    async (
      e: React.MouseEvent,
      { post, index, row, column }: Partial<CompanionTriggerProps> = {},
    ) => {
      // the check whether the user is logged in is done on the GrowthBook side
      // the feature flag is enabled only for logged-in users
      // -- check that this is correct
      if (!isExtension || contentScriptGranted) {
        await customPostClickHandler(post, index, row, column);
      } else if (
        // checking this also enrolls the user in the experiment
        // so this must be the last check after all others
        true ||
        gb.isOn(Features.EngagementLoopJuly2023Companion.id)
      ) {
        e.preventDefault();
        openModal({ post, index, row, column });
      } else {
        await customPostClickHandler(post, index, row, column);
      }
    },

    [
      alreadyCompleted,
      customPostClickHandler,
      isExtension,
      contentScriptGranted,
      gb,
      openModal,
    ],
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
