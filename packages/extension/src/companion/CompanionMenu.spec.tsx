import React from 'react';
import '@testing-library/jest-dom';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import type { PostBootData } from '@dailydotdev/shared/src/lib/boot';
import { CoresRole } from '@dailydotdev/shared/src/lib/user';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import CompanionMenu from './CompanionMenu';

jest.mock('react-modal', () => ({
  setAppElement: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/usePrompt', () => ({
  usePrompt: () => ({
    showPrompt: jest.fn(),
  }),
}));

jest.mock('./useCompanionActions', () => ({
  __esModule: true,
  default: () => ({
    bookmark: jest.fn(),
    removeBookmark: jest.fn(),
    blockSource: jest.fn(),
    disableCompanion: jest.fn(),
    removeCompanionHelper: jest.fn(),
    toggleCompanionExpanded: jest.fn(),
  }),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  useToastNotification: () => ({
    displayToast: jest.fn(),
  }),
  useVotePost: () => ({
    toggleUpvote: jest.fn(),
    toggleDownvote: jest.fn(),
  }),
}));

jest.mock('@dailydotdev/shared/src/hooks/useSharePost', () => ({
  useSharePost: () => ({
    openSharePost: jest.fn(),
  }),
}));

jest.mock('@dailydotdev/shared/src/hooks/useLazyModal', () => ({
  useLazyModal: jest.fn(),
}));

const mockOpenModal = jest.fn();

const defaultPost: PostBootData = {
  id: 'post-1',
  title: 'Test post',
  commentsPermalink: 'https://app.daily.dev/posts/post-1',
  trending: 1,
  summary: 'summary',
  numUpvotes: 3,
  numComments: 2,
  bookmarked: false,
  source: {
    id: 'source-1',
    name: 'Test source',
    image: 'https://daily.dev/source.png',
    type: SourceType.Machine,
  } as PostBootData['source'],
  image: 'https://daily.dev/post.png',
  createdAt: new Date().toISOString(),
  readTime: 4,
  tags: ['react'],
  permalink: 'https://app.daily.dev/posts/post-1',
  author: {
    id: 'author-1',
    username: 'author',
    name: 'Author',
    image: 'https://daily.dev/author.png',
    permalink: 'https://app.daily.dev/author',
    coresRole: CoresRole.Creator,
  } as unknown as PostBootData['author'],
  commented: false,
  type: 'article' as PostBootData['type'],
  flags: {
    banned: false,
    deleted: false,
    private: false,
    visible: true,
    showOnFeed: true,
    promoteToPublic: 0,
    campaignId: null,
    sentAnalyticsReport: false,
  },
  userState: {
    vote: UserVote.None,
    awarded: false,
  },
  numAwards: 0,
  featuredAward: undefined,
};

const renderComponent = (
  post: Partial<PostBootData> = {},
  authUser = {
    ...defaultUser,
    coresRole: CoresRole.User,
  },
) => {
  const client = new QueryClient();
  jest.mocked(useLazyModal).mockReturnValue({
    modal: null,
    closeModal: jest.fn(),
    openModal: mockOpenModal,
  } as unknown as ReturnType<typeof useLazyModal>);

  return render(
    <TestBootProvider client={client} auth={{ user: authUser }}>
      <CompanionMenu
        post={{ ...defaultPost, ...post }}
        companionHelper={false}
        setPost={jest.fn()}
        companionState={false}
        onOptOut={jest.fn()}
        setCompanionState={jest.fn()}
        verticalPosition={0}
        setVerticalPosition={jest.fn()}
        isDragging={false}
        setIsDragging={jest.fn()}
      />
    </TestBootProvider>,
  );
};

describe('CompanionMenu', () => {
  beforeEach(() => {
    mockOpenModal.mockReset();
  });

  it('renders the award button when the viewer can award the author', async () => {
    renderComponent();

    expect(await screen.findByLabelText('Award this post')).toBeInTheDocument();
  });

  it('hides the award button when the viewer cannot award the author', () => {
    renderComponent({}, { ...defaultUser, coresRole: CoresRole.None });

    expect(screen.queryByLabelText('Award this post')).not.toBeInTheDocument();
  });

  it('shows the award button for the post author', async () => {
    renderComponent(
      {},
      {
        ...defaultUser,
        id: 'author-1',
        coresRole: CoresRole.None,
      },
    );

    expect(await screen.findByLabelText('Award this post')).toBeInTheDocument();
  });

  it('opens the give award modal when clicking the award button', async () => {
    renderComponent();

    fireEvent.click(await screen.findByLabelText('Award this post'));

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.GiveAward,
      props: {
        type: 'POST',
        entity: {
          id: defaultPost.id,
          receiver: defaultPost.author,
          numAwards: defaultPost.numAwards,
        },
        post: defaultPost,
      },
    });
  });

  it('opens the awards list when the post was already awarded', async () => {
    renderComponent({
      userState: {
        vote: UserVote.None,
        awarded: true,
      },
      numAwards: 1,
      featuredAward: {
        award: {
          name: 'Gold',
          image: 'https://daily.dev/gold.png',
          value: 100,
        },
      },
    });

    fireEvent.click(
      await screen.findByLabelText('You already awarded this post!'),
    );

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ListAwards,
      props: {
        queryProps: {
          id: defaultPost.id,
          type: 'POST',
        },
      },
    });
  });

  it('opens the awards list for the post author', async () => {
    renderComponent(
      {},
      {
        ...defaultUser,
        id: 'author-1',
        coresRole: CoresRole.None,
      },
    );

    fireEvent.click(await screen.findByLabelText('Award this post'));

    expect(mockOpenModal).toHaveBeenCalledWith({
      type: LazyModal.ListAwards,
      props: {
        queryProps: {
          id: defaultPost.id,
          type: 'POST',
        },
      },
    });
  });
});
