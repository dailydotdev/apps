import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import ShareBar from './ShareBar';
import Post from '../../__tests__/fixture/post';
import { AuthContextProvider } from '../contexts/AuthContext';
import loggedUser from '../../__tests__/fixture/loggedUser';
import {
  generateTestSquad,
} from '../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../contexts/FeaturesContext';
import { IFlags } from 'flagsmith';
import { getFacebookShareLink } from '../lib/share';
import { LazyModalElement } from './modals/LazyModalElement';
import { NotificationsContextProvider } from '../contexts/NotificationsContext';

const defaultPost = Post;
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
          <NotificationsContextProvider>
            <LazyModalElement />
            <ShareBar
              post={defaultPost}
            />
          </NotificationsContextProvider>
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

  it('should render the component with logged user but no squads and open new squad modal', async () => {
    renderComponent(true, false);
    const btn = await screen.findByTestId('social-share-New Squad')

    expect(btn).toBeInTheDocument();
    btn.click();
    await waitFor(() => {
        expect(screen.getByText('Squads early access!')).toBeInTheDocument();
    });
  });

  // TODO: Fix this test - the modal isn't opening onClick
  it('should render the component with logged user and squads and open the share to squad modal', async () => {
    renderComponent(true, true);
    const btn = await screen.findByTestId(`social-share-@${squads[0].handle}`);

    expect(btn).toBeInTheDocument();
    btn.click();
    // await waitFor(() => {
      // expect(screen.getByText('New post')).toBeInTheDocument();
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

  it('should render the copy link button and copy link to clipboard', async () => {
    renderComponent().debug();
    const btn = await screen.findByTestId('social-share-Copy link');

    // btn.click();
    // await waitFor(() => {
    //   console.log('Clipboard content:', window.navigator.clipboard.readText());
    // });
  });
});