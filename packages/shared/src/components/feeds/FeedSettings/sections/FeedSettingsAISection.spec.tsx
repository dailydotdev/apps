import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
import type { LoggedUser } from '../../../../lib/user';
import { LogEvent, TargetType } from '../../../../lib/log';
import { RequestKey } from '../../../../lib/query';
import { UPDATE_USER_PROFILE_MUTATION } from '../../../../graphql/users';
import { FeedSettingsAISection } from './FeedSettingsAISection';

jest.mock('../../../../hooks/useFeedSettings', () => ({
  __esModule: true,
  default: jest.fn(() => ({ isLoading: false })),
}));

const renderComponent = ({
  user = defaultUser,
  updateUser = jest.fn(),
  logEvent = jest.fn(),
  queryClient = new QueryClient(defaultQueryClientTestingConfig),
}: {
  user?: LoggedUser;
  updateUser?: jest.Mock;
  logEvent?: jest.Mock;
  queryClient?: QueryClient;
} = {}) => {
  return {
    ...render(
      <TestBootProvider
        client={queryClient}
        auth={{ user, updateUser }}
        log={{ logEvent }}
      >
        <FeedSettingsAISection />
      </TestBootProvider>,
    ),
    logEvent,
    updateUser,
    queryClient,
  };
};

const mockUpdateUserProfile = (
  onBody: (body: Record<string, unknown>) => void,
) => {
  nock('http://localhost:3000')
    .post('/graphql', (body: Record<string, unknown>) => {
      if (body.query !== UPDATE_USER_PROFILE_MUTATION) {
        return false;
      }

      onBody(body);
      return true;
    })
    .reply(200, { data: { updateUserProfile: { id: defaultUser.id } } });
};

describe('FeedSettingsAISection', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should send null when reverting the language to original', async () => {
    let requestBody: Record<string, unknown> | undefined;
    const updateUser = jest.fn();
    const logEvent = jest.fn();
    mockUpdateUserProfile((body) => {
      requestBody = body;
    });

    renderComponent({
      user: { ...defaultUser, isPlus: true, language: 'de' },
      updateUser,
      logEvent,
    });

    await userEvent.click(screen.getByRole('button', { name: 'German' }));
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Original language' }),
    );

    await waitFor(() =>
      expect(requestBody).toMatchObject({
        variables: { data: { language: null } },
      }),
    );
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ language: null }),
    );
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.Language,
      target_id: 'original',
    });
  });

  it('should still send the selected language', async () => {
    let requestBody: Record<string, unknown> | undefined;
    mockUpdateUserProfile((body) => {
      requestBody = body;
    });

    renderComponent({
      user: { ...defaultUser, isPlus: true, language: null },
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Original language' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'German' }));

    await waitFor(() =>
      expect(requestBody).toMatchObject({
        variables: { data: { language: 'de' } },
      }),
    );
  });

  it('should invalidate feed and post query keys after a successful clear', async () => {
    const queryClient = new QueryClient(defaultQueryClientTestingConfig);
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    mockUpdateUserProfile(() => undefined);

    renderComponent({
      user: { ...defaultUser, isPlus: true, language: 'de' },
      queryClient,
    });

    await userEvent.click(screen.getByRole('button', { name: 'German' }));
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Original language' }),
    );

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: [RequestKey.Post],
        exact: false,
        type: 'all',
      }),
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [RequestKey.Bookmarks],
      exact: false,
      type: 'all',
    });
  });

  it('should disable language selection for non-Plus users', () => {
    renderComponent({
      user: { ...defaultUser, isPlus: false, language: 'de' },
    });

    expect(screen.getByRole('button', { name: 'German' })).toBeDisabled();
  });
});
