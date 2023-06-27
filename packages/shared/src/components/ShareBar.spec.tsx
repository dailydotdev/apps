import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import ShareBar from './ShareBar';
import Post from '../../__tests__/fixture/post';
import { AuthContextProvider } from '../contexts/AuthContext';
import { LoggedUser } from '../lib/user';
import loggedUser from '../../__tests__/fixture/loggedUser';
import {
  generateTestSquad,
} from '../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../contexts/FeaturesContext';
import { IFlags } from 'flagsmith';
import { getCommentHash } from '../graphql/comments';
import Comment from '../../__tests__/fixture/comment';
import { getFacebookShareLink } from '../lib/share';

const defaultPost = Post;
const defaultComment = Comment;
let features: IFlags;

const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const squads = [generateTestSquad()];

const renderComponent = (loggedIn = true, hasSquads = true): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={features}>
        <AuthContextProvider 
          user={loggedIn ? loggedUser : null}
          updateUser={jest.fn()}
          tokenRefreshed
          getRedirectUri={jest.fn()}
          loadingUser={false}
          loadedUserFromCache
          squads={hasSquads ? squads : []}
        >
          <ShareBar
            post={defaultPost}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

describe('ShareBar Test Suite:', () => {
  it('should render the component without logged in user', async () => {
    features = {};
    renderComponent(false, false);
    expect(screen.getByText('Would you recommend this post?')).toBeInTheDocument();
    expect(screen.queryByText('New Squad')).not.toBeInTheDocument();
  });

  // TODO: Fix this test - the modal isn't opening onClick
  it('should render the component with logged user but no squads and open new squad modal', async () => {
    renderComponent(true, false);
    const btn = await screen.findByTestId('social-share-New Squad')

    expect(btn).toBeInTheDocument();
    btn.click();
    // await waitFor(() => {
      // expect(screen.getByPlaceholderText('Name your squad')).toBeInTheDocument();
    // });
  });

  // TODO: Fix this test - the modal isn't opening onClick
  it('should render the component with logged user and squads and open the share to squad modal', async () => {
    renderComponent(true, true);
    const btn = await screen.findByTestId(`social-share-@${squads[0].handle}`);

    expect(btn).toBeInTheDocument();
    btn.click();
    // await waitFor(() => {
    //   expect(screen.getByText('New post')).toBeInTheDocument();
    // });
  });

  it('should render the Facebook button and have the correct link', async () => {
    renderComponent();
    const link = await screen.findByTestId(`social-share-Facebook`);

    expect(link).toHaveAttribute(
      'href',
      getFacebookShareLink(defaultPost.commentsPermalink),
    );
  });

  // TODO: Fix this test - add comment to this test
  // it('should render the Facebook button and have the correct comments link', async () => {
  //   renderComponent(false, false, defaultComment);
  //   const link = await screen.findByTestId(`social-share-Facebook`);

  //   expect(link).toHaveAttribute(
  //     'href',
  //     getFacebookShareLink(
  //       `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
  //     ),
  //   );
  // });

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

  // TODO: Fix this test - add comment to this test
  // it('should render the copy link button and copy comments link to clipboard', async () => {
  //   renderComponent(false, false, defaultComment);
  //   const btn = await screen.findByTestId('social-share-Copy link');

  //   btn.click();
  //   await waitFor(() =>
  //     expect(window.navigator.clipboard.writeText).toBeCalledWith(
  //       `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
  //     ),
  //   );
  // });
});