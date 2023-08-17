import React, { useCallback, useContext } from 'react';
import { useFeatureIsOn } from '../components/GrowthBookProvider';
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
  activateCompanion: () => void;
  openArticle: OpenArticle;
  toggleOpen: (value: boolean, data?: CompanionTriggerProps) => void;
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
  const { closeModal, openModal } = useLazyModal();
  const { isActionsFetched, checkHasCompleted, completeAction } = useActions();

  const featureEnabled = useFeatureIsOn(
    Features.EngagementLoopJuly2023Companion,
  );

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
  }, [isActionsFetched]);

  const articleClickHandler = useCallback(
    async (
      e: React.MouseEvent,
      { post, index, row, column }: Partial<CompanionTriggerProps> = {},
    ) => {
      // the check whether the user is logged in is done on the GrowthBook side
      // the feature flag is enabled only for logged-in users
      // -- check that this is correct
      if (
        !isExtension ||
        !featureEnabled ||
        alreadyCompleted ||
        contentScriptGranted
      ) {
        await customPostClickHandler(post, index, row, column);
      } else {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        toggleModal(true, { post, index, row, column });
      }
    },

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      alreadyCompleted,
      customPostClickHandler,
      isExtension,
      featureEnabled,
      contentScriptGranted,
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

  const activateCompanion = useCallback(async () => {
    await requestContentScripts();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    toggleModal(false);
    handleCompleteAction();

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestContentScripts]);

  const openArticle: OpenArticle = useCallback(
    (data) => async () => {
      await customPostClickHandler(
        data.post,
        data.index,
        data.row,
        data.column,
      );

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      toggleModal(false);
      handleCompleteAction();
    },
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customPostClickHandler],
  );

  const toggleModal = useCallback(
    (open: boolean, data?: CompanionTriggerProps) => {
      if (open) {
        openModal({
          type: LazyModal.CompanionModal,
          props: {
            url: data?.post?.permalink,
            onReadArticleClick: openArticle(data),
            onActivateCompanion: activateCompanion,
          },
        });
      } else {
        closeModal();
        handleCompleteAction();
      }

      const state = open ? 'open' : 'close';

      trackEvent({
        event_name: `${state} companion permission popup`,
        extra: JSON.stringify({ origin: 'automatic' }),
      });
    },

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openModal, closeModal, openArticle, activateCompanion],
  );

  return {
    onFeedArticleClick,
    onPostArticleClick,
    activateCompanion,
    openArticle,
    toggleOpen: toggleModal,
  };
}
