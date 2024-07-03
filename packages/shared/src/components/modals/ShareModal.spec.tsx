import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { useRouter } from 'next/router';
import ShareModal from './ShareModal';
import Post from '../../../__tests__/fixture/post';
import { getFacebookShareLink } from '../../lib/share';
import { Origin } from '../../lib/log';
import Comment from '../../../__tests__/fixture/comment';
import { getCommentHash } from '../../graphql/comments';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

const defaultPost = Post;
const defaultComment = Comment;
const onRequestClose = jest.fn();

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

let client: QueryClient;

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  client = new QueryClient();
});

const squads = [generateTestSquad()];

const renderComponent = (
  loggedIn = true,
  hasSquads = true,
  comment?,
): RenderResult => {
  return render(
    <TestBootProvider
      client={client}
      auth={{
        user: loggedIn ? loggedUser : null,
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
        loadingUser: false,
        loadedUserFromCache: true,
        squads: hasSquads ? squads : [],
      }}
    >
      <ShareModal
        origin={Origin.Feed}
        post={defaultPost}
        comment={comment}
        isOpen
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

describe('ShareModal Test Suite:', () => {
  const mockWindowOpen = jest.fn();
  let origWindowOpen = null;

  beforeEach(() => {
    origWindowOpen = window.open;
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    mockWindowOpen.mockClear();
    window.open = origWindowOpen;
  });

  it('should render the component without logged in user', async () => {
    renderComponent(false, false);
    expect(screen.getByText('Share with your squad')).toBeInTheDocument();
  });

  it('should render the component with logged user but no squads and open new squad page', async () => {
    renderComponent(true, false);
    const btn = await screen.findByTestId('social-share-New Squad');

    expect(btn).toBeInTheDocument();
    btn.click();
    const useRouterMock = useRouter as jest.Mock;
    const routerPushMock =
      useRouterMock.mock.results[useRouterMock.mock.results.length - 1].value
        .push;

    await waitFor(() => {
      expect(routerPushMock).toHaveBeenCalled();
      expect(routerPushMock).toHaveBeenCalledWith('/squads/new?origin=share');
    });
  });

  it('should render the component with logged user and squads and open the share to squad modal', async () => {
    renderComponent(true, true);
    const btn = await screen.findByTestId(`social-share-@${squads[0].handle}`);
    fireEvent.click(btn);
    await screen.findByText('New post');
  });

  it('should render the Facebook button and navigate to the correct link', async () => {
    renderComponent();
    const btn = await screen.findByTestId(`social-share-Facebook`);

    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        getFacebookShareLink(defaultPost.commentsPermalink),
        '_blank',
      );
    });
  });

  it('should render the Facebook button and navigate to the correct comments link', async () => {
    renderComponent(false, false, defaultComment);
    const btn = await screen.findByTestId(`social-share-Facebook`);

    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(
        getFacebookShareLink(
          `${defaultPost.commentsPermalink}${getCommentHash(
            defaultComment.id,
          )}`,
        ),
        '_blank',
      );
    });
  });

  it('should render the copy link button and copy link to clipboard', async () => {
    renderComponent();
    const btn = await screen.findByTestId('social-share-Copy link');

    btn.click();
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(
        defaultPost.commentsPermalink,
      ),
    );
  });

  it('should render the copy link button and copy comments link to clipboard', async () => {
    renderComponent(false, false, defaultComment);
    const btn = await screen.findByTestId('social-share-Copy link');

    btn.click();
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(
        `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
      ),
    );
  });
});
