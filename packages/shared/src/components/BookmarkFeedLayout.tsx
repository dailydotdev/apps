import React, {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import {
  BOOKMARKS_FEED_QUERY,
  SEARCH_BOOKMARKS_QUERY,
  supportedTypesForPrivateSources,
} from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import { CustomFeedHeader, FeedPageHeader } from './utilities';
import SearchEmptyScreen from './SearchEmptyScreen';
import Feed, { FeedProps } from './Feed';
import BookmarkEmptyScreen from './BookmarkEmptyScreen';
import { Button, ButtonProps, ButtonVariant } from './buttons/Button';
import { ShareIcon } from './icons';
import { generateQueryKey, OtherFeedPage, RequestKey } from '../lib/query';
import { useFeedLayout, usePlusSubscription } from '../hooks';
import { BookmarkSection } from './sidebar/sections/BookmarkSection';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import { BookmarkFolder } from '../graphql/bookmarks';
import { BookmarkFolderContextMenu } from './bookmark/BookmarkFolderContextMenu';

export type BookmarkFeedLayoutProps = {
  isReminderOnly?: boolean;
  searchQuery?: string;
  children?: ReactNode;
  searchChildren: ReactNode;
  onSearchButtonClick?: () => unknown;
  folder?: BookmarkFolder;
  title?: string;
};

const SharedBookmarksModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "sharedBookmarksModal" */ './modals/SharedBookmarksModal'
    ),
);

const ShareBookmarksButton = ({
  children,
  ...props
}: PropsWithChildren<
  Pick<ButtonProps<'button'>, 'className' | 'onClick' | 'icon'>
>) => (
  <Button variant={ButtonVariant.Secondary} {...props}>
    {children}
  </Button>
);

export default function BookmarkFeedLayout({
  searchQuery,
  searchChildren,
  children,
  folder,
  title = 'Bookmarks',
  isReminderOnly,
}: BookmarkFeedLayoutProps): ReactElement {
  const {
    shouldUseListFeedLayout,
    FeedPageLayoutComponent,
    shouldUseListMode,
  } = useFeedLayout();
  const { showPlusSubscription } = usePlusSubscription();
  const { user, tokenRefreshed } = useContext(AuthContext);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [showSharedBookmarks, setShowSharedBookmarks] = useState(false);
  const isFolderPage = !!folder || isReminderOnly;
  const listId = folder?.id;
  const defaultKey = useMemo(
    () => generateQueryKey(RequestKey.Bookmarks, user, listId),
    [user, listId],
  );

  const feedProps = useMemo<FeedProps<unknown>>(() => {
    if (searchQuery) {
      return {
        feedName: OtherFeedPage.SearchBookmarks,
        feedQueryKey: defaultKey.concat(searchQuery),
        query: SEARCH_BOOKMARKS_QUERY,
        variables: {
          query: searchQuery,
          supportedTypes: supportedTypesForPrivateSources,
        },
        emptyScreen: <SearchEmptyScreen />,
      };
    }
    return {
      feedName: OtherFeedPage.Bookmarks,
      feedQueryKey: defaultKey,
      query: BOOKMARKS_FEED_QUERY,
      variables: {
        ...(listId && { listId }),
        reminderOnly: isReminderOnly,
        supportedTypes: supportedTypesForPrivateSources,
      },
      onEmptyFeed: () => setShowEmptyScreen(true),
      options: { refetchOnMount: true },
    };
  }, [searchQuery, defaultKey, listId, isReminderOnly]);

  if (showEmptyScreen && !folder) {
    return <BookmarkEmptyScreen />;
  }

  return (
    <FeedPageLayoutComponent>
      {children}
      <FeedPageHeader className="mb-5">
        <Typography bold type={TypographyType.Title3} tag={TypographyTag.H1}>
          {title}
        </Typography>
      </FeedPageHeader>
      <CustomFeedHeader
        className={classNames(
          'mb-6',
          shouldUseListFeedLayout && !shouldUseListMode && 'px-4',
        )}
      >
        {searchChildren}
        {!isFolderPage && (
          <ShareBookmarksButton
            className="ml-4 flex"
            icon={<ShareIcon secondary={showSharedBookmarks} />}
            onClick={() => setShowSharedBookmarks(true)}
          >
            <span className="hidden laptop:inline">Share bookmarks</span>
          </ShareBookmarksButton>
        )}
        {isFolderPage && <BookmarkFolderContextMenu folder={folder} />}
      </CustomFeedHeader>

      {showSharedBookmarks && (
        <SharedBookmarksModal
          isOpen={showSharedBookmarks}
          onRequestClose={() => setShowSharedBookmarks(false)}
        />
      )}
      {showPlusSubscription && (
        <div className="mb-4 laptop:hidden">
          <BookmarkSection
            isItemsButton={false}
            sidebarExpanded
            shouldShowLabel
            activePage=""
          />
        </div>
      )}
      {isFolderPage && showEmptyScreen && <BookmarkEmptyScreen />}
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPageLayoutComponent>
  );
}
