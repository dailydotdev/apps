import React, { useState, useCallback } from 'react';
import { FeedPostClick } from './feed/useFeedOnPostClick';
import { Post } from '../graphql/posts';
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
  const [data, setData] = useState<CompanionTriggerProps>();
  const [isOpen, toggleOpen] = useState(false);

  // const { requestContentScripts, contentScriptGranted, isFetched } =
  //   useExtensionPermission({
  //     origin: 'companion modal permission button',
  //     onPermission: () => {
  //       if (data) {
  //         readArticleHandler(data.post, data.index, data.row, data.column);
  //       }
  //     },
  //   });

  const articleClickHandler = useCallback(
    async (
      e: React.MouseEvent,
      { post, index, row, column }: Partial<CompanionTriggerProps> = {},
    ) => {
      if (!isExtension) {
        // TODO: add contentScriptGranted || isFetched || feature flag check
        await customPostClickHandler(post, index, row, column);
      } else {
        e.preventDefault();
        setData({ post, index, row, column });
        toggleOpen(true);
      }
    },
    [customPostClickHandler, isExtension],
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
    toggleOpen(false);
  }, []);

  const openArticle = useCallback(async () => {
    console.log('OPENING');
    await customPostClickHandler(data.post, data.index, data.row, data.column);

    toggleOpen(false);
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
