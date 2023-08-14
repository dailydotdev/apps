import React, { useState, useCallback, useContext } from 'react';
import { useFeatureIsOn } from '@growthbook/growthbook-react';
import { FeedPostClick } from './feed/useFeedOnPostClick';
import { Post } from '../graphql/posts';
import { Features } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';

// import { useExtensionPermission } from '../../../extension/src/companion/useExtensionPermission';

type CompanionTriggerProps = {
  post: Post;
  index: number;
  row: number;
  column: number;
};

export type CompanionTrigger = {
  postUrl?: string;
  onFeedArticleClick: FeedPostClick;
  onPostArticleClick: (e: React.MouseEvent) => Promise<void>;
  activateCompanion: () => void;
  openArticle: () => Promise<void>;
  isOpen: boolean;
  toggleOpen: (value: boolean) => void;
};

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
  const [data, setData] = useState<CompanionTriggerProps>();
  const [isOpen, toggleOpen] = useState(false);
  const featureEnabled = useFeatureIsOn(
    Features.EngagementLoopJuly2023Companion.toString(), // this feels very smelly, but otherwise complains because of the Features<string> type
  );
  // const { requestContentScripts, contentScriptGranted, isFetched } =
  //   useExtensionPermission({
  //     origin: 'companion modal permission button',
  //     onPermission: () => {
  //       if (data) {
  //         readArticleHandler(data.post, data.index, data.row, data.column);
  //       }
  //     },
  //   });

  const handleToggle = useCallback((opened: boolean) => {
    toggleOpen(opened);
    const state = opened ? 'open' : 'close';

    trackEvent({
      event_name: `${state} companion permission popup`,
      extra: JSON.stringify({ origin: 'automatic' }),
    });

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const articleClickHandler = useCallback(
    async (
      e: React.MouseEvent,
      { post, index, row, column }: Partial<CompanionTriggerProps> = {},
    ) => {
      if (!isExtension) {
        // TODO: add contentScriptGranted || isFetched from useExtensionPermission
        await customPostClickHandler(post, index, row, column);
      } else {
        e.preventDefault();
        setData({ post, index, row, column });
        handleToggle(true);
      }
    },

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customPostClickHandler, isExtension, featureEnabled],
  );

  const onFeedArticleClick = useCallback<FeedPostClick>(
    async (post, index, row, column, { clickEvent }) => {
      await articleClickHandler(clickEvent, { post, index, row, column });
    },
    [articleClickHandler],
  );

  const onPostArticleClick = useCallback(
    async (e: React.MouseEvent) => {
      await articleClickHandler(e);
    },
    [articleClickHandler],
  );

  const activateCompanion = useCallback(async () => {
    // await requestContentScripts();
    handleToggle(false);
  }, [handleToggle]);

  const openArticle = useCallback(async () => {
    await customPostClickHandler(data.post, data.index, data.row, data.column);

    handleToggle(false);

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, customPostClickHandler]);

  return {
    postUrl: data?.post?.permalink,
    onFeedArticleClick,
    onPostArticleClick,
    activateCompanion,
    openArticle,
    isOpen,
    toggleOpen,
  };
}
