import { useCallback, useContext, useRef } from 'react';
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useContextMenu } from '@dailydotdev/react-contexify';
import {
  ADD_BOOKMARKS_MUTATION,
  banPost,
  deletePost,
  demotePost,
  Post,
  promotePost,
  REMOVE_BOOKMARK_MUTATION,
  updatePinnedPost,
  UserPostVote,
  VOTE_POST_MUTATION,
} from '../../graphql/posts';
import {
  ToggleVoteProps,
  upvoteMutationKey,
  voteMutationHandlers,
} from '../vote';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent, Origin } from '../../lib/analytics';
import useReportPost from '../useReportPost';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { AuthTriggers } from '../../lib/auth';
import { graphqlUrl } from '../../lib/config';
import { useRequestProtocol } from '../useRequestProtocol';
import AuthContext from '../../contexts/AuthContext';
import { ToastSubject, useToastNotification } from '../useToastNotification';
import { PromptOptions, usePrompt } from '../usePrompt';
import { Roles } from '../../lib/user';
import { SourcePermissions, SourceType } from '../../graphql/sources';
import { SourceActionArguments, TagActionArguments } from '../useTagAndSource';
import useMutateFilters from '../useMutateFilters';
import AlertContext from '../../contexts/AlertContext';
import useFeedSettings from '../useFeedSettings';
import { bookmarkMutationKey, BookmarkProps } from '../useBookmarkPost';
import { useActiveFeedContext } from '../../contexts';

const multiPostTransformer = (
  posts: Post[],
  id: string,
  update: (oldPost: Post) => Partial<Post>,
): Post[] =>
  posts.map((post) =>
    post.id === id
      ? {
          ...post,
          ...update(post),
        }
      : post,
  );

const multiPageTransformer = (
  pages: { page: { edges: { node: Post }[] } }[],
  id: string,
  update: (oldPost: Post) => Partial<Post>,
): { page: { edges: { node: Post }[] } }[] => {
  return pages.map(({ page }) => {
    const edges = page.edges.map((edge) => {
      const tmpEdge = { ...edge };
      if (tmpEdge.node.id === id) {
        tmpEdge.node = { ...tmpEdge.node, ...update(tmpEdge.node) };
      }
      return tmpEdge;
    });
    return { page: { ...page, edges } };
  });
};

const updateMap = {
  'single-post': {
    transformer: multiPostTransformer,
  },
  'further-reading': {
    transformer: ({ previousData, id, update }) => ({
      ...previousData,
      trendingPosts: multiPostTransformer(
        previousData.trendingPosts,
        id,
        update,
      ),
      similarPosts: multiPostTransformer(previousData.similarPosts, id, update),
    }),
  },
  feed: {
    transformer: ({ previousData, id, update }) => ({
      ...previousData,
      pages: multiPageTransformer(previousData.pages, id, update),
    }),
    remover: ({ previousData, id }) => ({
      ...previousData,
      pages: previousData.pages.map(({ page }) => ({
        page: {
          ...page,
          edges: page.edges.filter((edge) => edge.node.id !== id),
        },
      })),
    }),
  },
};

const updatePost =
  (
    queryClient: QueryClient,
    queryKey: unknown[],
    transformKey: string,
    update: (oldPost: Post) => Partial<Post>,
  ): ((args: { id: string }) => Promise<() => void>) =>
  async ({ id }) => {
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(
      queryKey,
      updateMap[transformKey].transformer({ previousData, id, update }),
    );
    return () => {
      queryClient.setQueryData(queryKey, previousData);
    };
  };

export default function useLeanPostActions({
  transformKey = 'feed',
}: { transformKey?: string } = {}): {
  onUpvote: (post: Post) => Promise<void>;
  onHidePost: (post: Post) => Promise<void>;
  onDownvote: (post: Post) => Promise<void>;
  onBookmark: (post: Post) => Promise<void>;
  onPromotePost: (post: Post) => Promise<void>;
  onBanPost: (post: Post) => Promise<void>;
  onPinPost: (post: Post) => Promise<void>;
  canDeletePost: (post: Post) => boolean;
  canPinPost: (post: Post) => boolean;
  onDeletePost: (post: Post) => Promise<void>;
  onBlockSource: (post: Post) => Promise<void>;
  onBlockTag: (post: Post, tag: string) => Promise<void>;
  onDirectClick: (post: Post) => Promise<void>;
  showMessageAndRemovePost: (
    message: string,
    post: Post,
    undo?: () => unknown,
  ) => Promise<void>;
  show: (e: React.MouseEvent) => void;
} {
  const { queryKey, feedName, feedRef } = useActiveFeedContext();
  const { requestMethod } = useRequestProtocol();
  const { user, showLogin } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { hidePost, unhidePost } = useReportPost();
  const { trackEvent } = useAnalyticsContext();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const { alerts, updateAlerts } = useContext(AlertContext);
  const { feedSettings } = useFeedSettings();
  const { show } = useContextMenu();
  const computedRef = useRef<CSSStyleDeclaration>();
  if (!computedRef.current && feedRef?.current) {
    computedRef.current = globalThis?.window?.getComputedStyle(
      feedRef?.current,
    );
  }
  const renderedColumnLength =
    computedRef?.current?.gridTemplateColumns?.split(' ')?.length;

  const calculateRow = (index: number): number =>
    Math.floor(index / renderedColumnLength);
  const calculateColumn = (index: number): number =>
    index % renderedColumnLength;

  const isModerator = user?.roles?.includes(Roles.Moderator);
  const canDeletePost = useCallback(
    (post: Post) => {
      const isSharedPostAuthor =
        post?.source.type === SourceType.Squad && post?.author?.id === user?.id;
      return (
        isModerator ||
        isSharedPostAuthor ||
        post?.source.currentMember?.permissions?.includes(
          SourcePermissions.PostDelete,
        )
      );
    },
    [isModerator, user?.id],
  );

  const { followTags, blockTag, unblockTag, followSource, unfollowSource } =
    useMutateFilters(user);

  const canPinPost = useCallback((post: Post) => {
    return post?.source.currentMember?.permissions?.includes(
      SourcePermissions.PostPin,
    );
  }, []);

  const showMessageAndRemovePost = useCallback(
    async (
      message: string,
      post: Post,
      undo?: () => unknown,
    ): Promise<void> => {
      const onUndo = async () => {
        await undo?.();
        return queryClient.invalidateQueries(queryKey);
      };
      displayToast(message, {
        subject: ToastSubject.Feed,
        onUndo: undo !== null ? onUndo : null,
      });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(
        queryKey,
        updateMap[transformKey].remover({ previousData, id: post.id }),
      );
    },
    [displayToast, queryClient, queryKey, transformKey],
  );

  const onPromotePost = useCallback(
    async (post: Post) => {
      const promoteFlag = post.flags?.promoteToPublic;

      const options: PromptOptions = {
        title: promoteFlag ? 'Demote post' : 'Promote post',
        description: `Do you want to ${
          promoteFlag ? 'demote' : 'promote'
        } this post ${promoteFlag ? 'from' : 'to'} the public?`,
        okButton: {
          title: promoteFlag ? 'Demote' : 'Promote',
        },
      };
      if (await showPrompt(options)) {
        if (promoteFlag) {
          await demotePost(post.id);
        } else {
          await promotePost(post.id);
        }
      }
    },
    [showPrompt],
  );

  const onBanPost = useCallback(
    async (post: Post) => {
      const options: PromptOptions = {
        title: 'Ban post 💩',
        description: 'Are you sure you want to ban this post?',
        okButton: {
          title: 'Ban',
          className: 'btn-primary-ketchup',
        },
      };
      if (await showPrompt(options)) {
        await banPost(post.id);
      }
    },
    [showPrompt],
  );

  const onHidePost = useCallback(
    async (post: Post) => {
      const { successful } = await hidePost(post.id);

      if (!successful) {
        return;
      }

      trackEvent(
        postAnalyticsEvent('hide post', post, {
          extra: { origin: Origin.PostContextMenu },
        }),
      );

      showMessageAndRemovePost(
        '🙈 This post won’t show up on your feed anymore',
        post,
        () => unhidePost(post.id),
      );
    },
    [hidePost, showMessageAndRemovePost, trackEvent, unhidePost],
  );

  const { mutateAsync: actualDeletePost } = useMutation((id: string) =>
    deletePost(id),
  );
  const onDeletePost = useCallback(
    async (post: Post) => {
      const deletePromptOptions: PromptOptions = {
        title: 'Delete post?',
        description:
          'Are you sure you want to delete this post? This action cannot be undone.',
        okButton: {
          title: 'Delete',
          className: 'btn-primary-cabbage',
        },
      };

      if (await showPrompt(deletePromptOptions)) {
        await actualDeletePost(post.id);
        showMessageAndRemovePost('The post has been deleted', post, () =>
          unhidePost(post.id),
        );
      }
    },
    [actualDeletePost, showMessageAndRemovePost, showPrompt, unhidePost],
  );

  const { mutateAsync: actualPinPost } = useMutation(
    (post: Post) => updatePinnedPost({ id: post.id, pinned: !post.pinnedAt }),
    {
      onMutate: (post) => {
        updatePost(queryClient, queryKey, transformKey, () => ({
          pinnedAt: post.pinnedAt ? null : new Date(),
        }))({ id: post.id });
        return undefined;
      },
    },
  );
  const onPinPost = useCallback(
    async (post: Post) => {
      await actualPinPost(post);
      displayToast(
        post.pinnedAt
          ? 'Your post has been unpinned'
          : '📌 Your post has been pinned',
      );
    },
    [actualPinPost, displayToast],
  );

  type UseBookmarkPostMutationProps = {
    bookmarked: boolean;
    id?: string;
    mutation?: string;
    payload?: Record<string, unknown>;
  };
  const { mutateAsync: bookmarkPost } = useMutation(
    ({ mutation, payload }: UseBookmarkPostMutationProps) =>
      requestMethod(graphqlUrl, mutation, {
        ...payload,
      }),
    {
      mutationKey: bookmarkMutationKey,
      onMutate: (post) => {
        updatePost(queryClient, queryKey, transformKey, () => ({
          bookmarked: post.bookmarked,
        }))({ id: post.id });
        return undefined;
      },
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

  const addBookmark = useCallback(
    ({ id }: BookmarkProps) => {
      return bookmarkPost({
        bookmarked: true,
        id,
        mutation: ADD_BOOKMARKS_MUTATION,
        payload: { data: { postIds: [id] } },
      });
    },
    [bookmarkPost],
  );

  const removeBookmark = useCallback(
    ({ id }: BookmarkProps) => {
      return bookmarkPost({
        bookmarked: false,
        id,
        mutation: REMOVE_BOOKMARK_MUTATION,
        payload: { id },
      });
    },
    [bookmarkPost],
  );

  const { mutateAsync: votePost } = useMutation(
    ({ post, vote }: { post: Post; vote: UserPostVote }) => {
      return requestMethod(graphqlUrl, VOTE_POST_MUTATION, {
        id: post.id,
        vote,
      });
    },
    {
      mutationKey: upvoteMutationKey,
      onMutate: ({ post, vote }) => {
        updatePost(queryClient, queryKey, transformKey, () =>
          voteMutationHandlers[vote](post),
        )({ id: post.id });
        return undefined;
      },
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

  const upvotePost = useCallback(
    ({ post }) => {
      return votePost({ post, vote: UserPostVote.Up });
    },
    [votePost],
  );
  const downvotePost = useCallback(
    ({ post }) => {
      return votePost({ post, vote: UserPostVote.Down });
    },
    [votePost],
  );
  const cancelPostVote = useCallback(
    ({ post }) => {
      return votePost({ post, vote: UserPostVote.None });
    },
    [votePost],
  );

  const toggleUpvote = useCallback(
    async ({ post }: ToggleVoteProps) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });

        return;
      }

      if (post?.userState?.vote === UserPostVote.Up) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, {
            columns: renderedColumnLength ?? 1,
            column: calculateColumn(post.index),
            row: calculateRow(post.index),
            extra: {
              origin: 'origin' ?? Origin.Feed,
              feed: feedName,
            },
          }),
        );
        await cancelPostVote({ post });
        return;
      }

      trackEvent(
        postAnalyticsEvent(AnalyticsEvent.UpvotePost, post, {
          columns: renderedColumnLength ?? 1,
          column: calculateColumn(post.index),
          row: calculateRow(post.index),
          extra: {
            origin: 'origin' ?? Origin.Feed,
            feed: feedName,
          },
        }),
      );
      await upvotePost({ post });
    },
    [cancelPostVote, feedName, showLogin, trackEvent, upvotePost, user],
  );

  const toggleDownvote = useCallback(
    async ({ post }) => {
      if (!post) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Downvote });

        return;
      }

      if (post?.userState?.vote === UserPostVote.Down) {
        await cancelPostVote({ post });
        return;
      }

      downvotePost({ post });
    },
    [cancelPostVote, downvotePost, showLogin, user],
  );

  const onDirectClick = useCallback(
    (post: Post) => {
      // TODO: Add tracking
      // TODO: This should actually set it to be read in DB (onFeedItemClick)
      updatePost(queryClient, queryKey, transformKey, () => ({
        read: true,
      }))({ id: post.id });
      return null;
    },
    [queryClient, queryKey, transformKey],
  );

  const onUpvote = useCallback(
    async (post: Post) => {
      return toggleUpvote({ post, origin: Origin.PostContextMenu });
    },
    [toggleUpvote],
  );

  const onDownvote = useCallback(
    async (post: Post) => {
      return toggleDownvote({ post, origin: Origin.PostContextMenu });
    },
    [toggleDownvote],
  );

  const onFollowSource = useCallback(
    async ({ source }: SourceActionArguments) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return { successful: false };
      }
      await followSource({ source });
      return { successful: true };
    },
    [followSource, showLogin, user],
  );

  const onUnfollowSource = useCallback(
    async ({ source }: SourceActionArguments) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return { successful: false };
      }

      await unfollowSource({ source });

      return { successful: true };
    },
    [showLogin, unfollowSource, user],
  );

  const onBlockTags = useCallback(
    async ({ tags }: TagActionArguments) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return { successful: false };
      }

      await blockTag({ tags });

      return { successful: true };
    },
    [blockTag, showLogin, user],
  );

  const onBlockSource = useCallback(
    async (post: Post) => {
      const { successful } = await onUnfollowSource({
        source: post?.source,
        requireLogin: true,
      });

      if (!successful) {
        return;
      }

      showMessageAndRemovePost(`🚫 ${post?.source?.name} blocked`, post, () =>
        onFollowSource({ source: post?.source }),
      );
    },
    [onFollowSource, onUnfollowSource, showMessageAndRemovePost],
  );

  const onFollowTags = useCallback(
    async ({ tags }: TagActionArguments) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return { successful: false };
      }

      if (alerts?.filter && user) {
        updateAlerts({ filter: false, myFeed: 'created' });
      }
      await followTags({ tags });

      return { successful: true };
    },
    [alerts?.filter, followTags, showLogin, updateAlerts, user],
  );

  const onUnblockTags = useCallback(
    async ({ tags }: TagActionArguments) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
        return { successful: false };
      }
      await unblockTag({ tags });

      return { successful: true };
    },
    [showLogin, unblockTag, user],
  );

  const onBlockTag = useCallback(
    async (post: Post, tag) => {
      const { successful } = await onBlockTags({
        tags: [tag],
        requireLogin: true,
      });

      if (!successful) {
        return;
      }

      const isTagFollowed = feedSettings?.includeTags?.indexOf(tag) !== -1;
      const undoAction = isTagFollowed ? onFollowTags : onUnblockTags;
      showMessageAndRemovePost(`⛔️ #${tag} blocked`, post, () =>
        undoAction({ tags: [tag], requireLogin: true }),
      );
    },
    [
      feedSettings?.includeTags,
      onBlockTags,
      onFollowTags,
      onUnblockTags,
      showMessageAndRemovePost,
    ],
  );

  const toggleBookmark = useCallback(
    async (post: Post) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Bookmark });
      }

      const targetBookmarkState = !post.bookmarked;
      if (targetBookmarkState) {
        await addBookmark({ id: post.id });
        displayToast('Post was added to your bookmarks');
      } else {
        await removeBookmark({ id: post.id });
        displayToast('Post was removed from your bookmarks');
      }
    },
    [addBookmark, displayToast, removeBookmark, showLogin, user],
  );

  return {
    onUpvote,
    onHidePost,
    onDownvote,
    onBookmark: toggleBookmark,
    onPromotePost: isModerator ? onPromotePost : undefined,
    onBanPost: isModerator ? onBanPost : undefined,
    onPinPost,
    canDeletePost,
    canPinPost,
    onDeletePost,
    onBlockSource,
    onBlockTag,
    onDirectClick,
    showMessageAndRemovePost,
    show,
  };
}
