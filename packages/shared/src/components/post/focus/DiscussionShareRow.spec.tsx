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
import type { UserIntegration } from '../../../graphql/integrations';
import { UserIntegrationType } from '../../../graphql/integrations';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);

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
  mockFeature.mockReturnValue({ value: false, isLoading: false });
});

const squads = Array.from({ length: 6 }, (_, index) =>
  generateTestSquad({
    id: `squad-${index}`,
    handle: `webteam-${index}`,
    name: `Web team ${index}`,
  }),
);

const renderComponent = (
  withSquads = true,
  integrations?: UserIntegration[],
): RenderResult => {
  const client = new QueryClient();

  if (integrations) {
    client.setQueryData(
      generateQueryKey(RequestKey.UserIntegrations, loggedUser),
      integrations,
    );
  }

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

  describe('with Slack state shown', () => {
    beforeEach(() => {
      mockFeature.mockReturnValue({ value: true, isLoading: false });
    });

    it('holds Slack disabled until integrations settle', () => {
      renderComponent(false);

      expect(
        screen.getByRole('button', { name: 'Send to Slack' }),
      ).toBeDisabled();
      expect(
        screen.queryByRole('button', { name: 'Connect Slack' }),
      ).not.toBeInTheDocument();
    });

    it('offers to connect when there is no workspace', () => {
      renderComponent(false, []);

      expect(
        screen.getByRole('button', { name: 'Connect Slack' }),
      ).toBeEnabled();
    });

    it('offers to send once a workspace is connected', () => {
      renderComponent(false, [
        {
          id: 'integration-1',
          type: UserIntegrationType.Slack,
        } as UserIntegration,
      ]);

      expect(
        screen.getByRole('button', { name: 'Send to Slack' }),
      ).toBeEnabled();
    });
  });
});
