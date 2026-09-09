import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import nock from 'nock';
import Post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { settingsContext } from '../../../../__tests__/helpers/boot';
import { AuthContextProvider } from '../../../contexts/AuthContext';
import SettingsContext from '../../../contexts/SettingsContext';
import { NotificationsContextProvider } from '../../../contexts/NotificationsContext';
import { LazyModalElement } from '../../modals/LazyModalElement';
import { DiscussionShareRow } from './DiscussionShareRow';

const defaultPost = Post;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const squads = Array.from({ length: 6 }, (_, index) =>
  generateTestSquad({
    id: `squad-${index}`,
    handle: `webteam-${index}`,
    name: `Web team ${index}`,
  }),
);

const renderComponent = (withSquads = true): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={loggedUser}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
        squads={squads}
      >
        <SettingsContext.Provider value={settingsContext}>
          <NotificationsContextProvider>
            <LazyModalElement />
            <DiscussionShareRow post={defaultPost} withSquads={withSquads} />
          </NotificationsContextProvider>
        </SettingsContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

describe('DiscussionShareRow', () => {
  it('opens the share composer seeded with the post when a squad is clicked', async () => {
    renderComponent();

    screen.getByRole('button', { name: 'Share to Web team 0' }).click();

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Post commentary' }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('textbox', { name: 'Link URL' })).toHaveValue(
      defaultPost.permalink,
    );
  });

  it('caps the inline squads at four', () => {
    renderComponent();

    expect(
      screen.getAllByRole('button', { name: /^Share to Web team/ }),
    ).toHaveLength(4);
  });

  it('shows no squad avatars unless asked for them', () => {
    renderComponent(false);

    expect(
      screen.queryByRole('button', { name: /^Share to Web team/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'More sharing options' }),
    ).toBeInTheDocument();
  });
});
