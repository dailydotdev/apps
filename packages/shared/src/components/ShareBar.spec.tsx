import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import { useRouter } from 'next/router';
import ShareBar from './ShareBar';
import Post from '../../__tests__/fixture/post';
import { AuthContextProvider } from '../contexts/AuthContext';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../__tests__/fixture/squads';
import { getFacebookShareLink } from '../lib/share';
import { LazyModalElement } from './modals/LazyModalElement';
import { NotificationsContextProvider } from '../contexts/NotificationsContext';

const defaultPost = Post;
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const squads = [generateTestSquad()];
const manySquads = Array.from({ length: 5 }, (_, index) =>
  generateTestSquad({
    id: `squad-${index}`,
    handle: `webteam-${index}`,
    name: `Web team ${index}`,
  }),
);

const renderComponent = (
  loggedIn = true,
  customSquads: typeof squads = squads,
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedIn ? loggedUser : null}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={customSquads}
      >
        <NotificationsContextProvider>
          <LazyModalElement />
          <ShareBar post={defaultPost} />
        </NotificationsContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

describe('ShareBar Test Suite:', () => {
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

  it('should render the component for anonymous users', async () => {
    renderComponent(false, []);
    expect(
      screen.getByText('Would you recommend this post?'),
    ).toBeInTheDocument();
    expect(screen.queryByText('New Squad')).toBeInTheDocument();
  });

  it('should render the component with logged user but no squads and open new squad page', async () => {
    renderComponent(true, []);
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
    renderComponent();
    const btn = await screen.findByTestId(`social-share-@${squads[0].handle}`);

    expect(btn).toBeInTheDocument();
    btn.click();
    await waitFor(() => {
      expect(screen.getByText('New post')).toBeInTheDocument();
    });
  });

  it('should render the Facebook button and navigate to correct link', async () => {
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

  it('should collapse squad options and expand on demand', async () => {
    renderComponent(true, manySquads);

    expect(
      screen.getByRole('button', { name: 'Show more options' }),
    ).toBeVisible();
    expect(
      screen.queryByTestId('social-share-@webteam-4'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show more options' }));

    expect(
      await screen.findByTestId('social-share-@webteam-4'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show fewer options' }),
    ).toBeVisible();
  });
});
