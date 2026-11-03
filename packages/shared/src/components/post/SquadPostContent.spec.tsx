import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import {
  postWithCommunitySentiment,
  sharePost,
} from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { CoresRole } from '../../lib/user';
import type { Action } from '../../graphql/actions';
import { ActionType } from '../../graphql/actions';
import { generateQueryKey, getPostByIdKey, RequestKey } from '../../lib/query';
import { LazyModal } from '../modals/common/types';
import * as lazyModal from '../../hooks/useLazyModal';
import { SquadPostContentRaw } from './SquadPostContent';

jest.mock('./SquadPostWidgets', () => ({
  SquadPostWidgets: () => <aside />,
}));

const sharedPostWithCommunitySentiment: Post = {
  ...sharePost,
  sharedPost: {
    ...sharePost.sharedPost!,
    communitySentiment: postWithCommunitySentiment.communitySentiment,
  },
};

const renderContent = (post: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SquadPostContentRaw post={post} origin={Origin.ArticleModal} />
    </TestBootProvider>,
  );

const renderPostPage = (post: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SquadPostContentRaw post={post} origin={Origin.ArticlePage} isPostPage />
    </TestBootProvider>,
  );

const LONG_PARAGRAPH =
  'The squad wrote the argument out in the post itself, and this paragraph is the claim a reader would want to lift out of it on its own.';

const freeformPost: Post = {
  ...sharePost,
  type: PostType.Freeform,
  sharedPost: undefined,
  contentHtml: `<p>${LONG_PARAGRAPH}</p>`,
};

describe('SquadPostContent community sentiment', () => {
  it('renders in the classic share post layout when the shared post has a take', () => {
    renderContent(sharedPostWithCommunitySentiment);

    expect(
      screen.getByRole('region', { name: 'What the community thinks' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Most agree it is worth reading.')).toBeVisible();
  });

  it('stays hidden in the classic share post layout when the shared post has no take', () => {
    renderContent(sharePost);

    expect(
      screen.queryByRole('region', { name: 'What the community thinks' }),
    ).not.toBeInTheDocument();
  });
});

describe('SquadPostContent snapshot placements', () => {
  beforeAll(() => {
    // jsdom has no layout, and the bar refuses a selection it cannot place.
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
  });

  it('ends a paragraph of a freeform body with a snapshot control', async () => {
    renderPostPage(freeformPost);

    await waitFor(() =>
      expect(screen.getByLabelText('Snapshot')).toBeInTheDocument(),
    );
  });

  it('runs a snapshot control into the end of a shared post TLDR', () => {
    renderPostPage(sharePost);

    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Snapshot'),
    );
  });

  it('runs a snapshot control into the end of a shared post TLDR in the modal', () => {
    renderContent(sharePost);

    expect(screen.getByTestId('tldr-container')).toContainElement(
      screen.getByLabelText('Snapshot'),
    );
  });

  it.each([
    { surface: 'page', render: renderPostPage },
    { surface: 'modal', render: renderContent },
  ])(
    'offers the shared video TLDR snapshot on the $surface',
    ({ render: renderPost }) => {
      renderPost({
        ...sharePost,
        sharedPost: {
          ...sharePost.sharedPost!,
          type: PostType.VideoYouTube,
          videoId: 'video-id',
        },
      });

      expect(screen.getByTestId('tldr-container')).toContainElement(
        screen.getByLabelText('Snapshot'),
      );
    },
  );

  it('offers a snapshot of a quote selected in the post', () => {
    renderContent(sharePost);

    const node = screen.getByTestId('tldr-container').firstChild as Node;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent?.length ?? 0);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    // The reader letting go of the drag is what commits the quote.
    fireEvent.pointerUp(document);

    expect(
      screen.getByRole('toolbar', { name: 'Share selected text' }),
    ).toBeInTheDocument();
  });
});

describe('SquadPostContent new post boost strip', () => {
  const author = { ...loggedUser, coresRole: CoresRole.User };
  const ownPost: Post = {
    ...freeformPost,
    private: false,
    author: { ...freeformPost.author!, id: author.id },
  };
  const openModal = jest.fn();

  const renderOwnPostPage = (actions: Action[]) => {
    const client = new QueryClient();
    client.setQueryData(getPostByIdKey(ownPost.id), { post: ownPost });
    client.setQueryData(generateQueryKey(RequestKey.Actions, author), {
      actions,
      serverLoaded: true,
    });
    jest.spyOn(lazyModal, 'useLazyModal').mockReturnValue({
      openModal,
      closeModal: jest.fn(),
      modal: undefined,
    } as unknown as ReturnType<typeof lazyModal.useLazyModal>);

    render(
      <TestBootProvider client={client} auth={{ user: author }}>
        <SquadPostContentRaw
          post={ownPost}
          origin={Origin.ArticlePage}
          isPostPage
        />
      </TestBootProvider>,
    );
  };

  afterEach(() => {
    openModal.mockClear();
    jest.restoreAllMocks();
  });

  it('attributes a boost opened while the strip shows to the strip', async () => {
    renderOwnPostPage([]);

    await screen.findByText('Boost to reach');
    fireEvent.click(screen.getAllByRole('button', { name: 'Boost' })[0]);

    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.BoostPost,
      props: { post: ownPost, origin: Origin.NewPostBoostStrip },
    });
  });

  it('attributes the Boost button to itself once the strip was dismissed', async () => {
    renderOwnPostPage([
      {
        type: ActionType.ClosedNewPostBoostBanner,
        completedAt: new Date(),
      },
    ]);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Boost' }))[0],
    );

    expect(screen.queryByText('Boost to reach')).not.toBeInTheDocument();
    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.BoostPost,
      props: { post: ownPost, origin: Origin.PostBoostButton },
    });
  });
});
