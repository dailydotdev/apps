import React from 'react';
import type { ReactNode } from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import loggedUser from '../../__tests__/fixture/loggedUser';
import type { AuthContextData } from '../contexts/AuthContext';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import { useEnsureUserTimezone } from './useEnsureUserTimezone';

const deviceTimezone = 'Asia/Tokyo';
const updateUser = jest.fn();

const mockDeviceTimezone = (timeZone: string): void => {
  const OriginalDateTimeFormat = Intl.DateTimeFormat;

  jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(((
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat => {
    const formatter = new OriginalDateTimeFormat(locales, options);

    return {
      ...formatter,
      format: formatter.format.bind(formatter),
      resolvedOptions: () => ({ ...formatter.resolvedOptions(), timeZone }),
    } as Intl.DateTimeFormat;
  }) as typeof Intl.DateTimeFormat);
};

const mockProfileUpdate = (): nock.Scope =>
  nock('http://localhost:3000')
    .post('/graphql', (body) => body.query === UPDATE_USER_PROFILE_MUTATION)
    .reply(200, { data: { updateUserProfile: { id: loggedUser.id } } });

const renderEnsureTimezone = (auth: Partial<AuthContextData>): void => {
  const client = new QueryClient();

  renderHook(() => useEnsureUserTimezone(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestBootProvider client={client} auth={{ updateUser, ...auth }}>
        {children}
      </TestBootProvider>
    ),
  });
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  mockDeviceTimezone(deviceTimezone);
});

it('saves the device timezone when the profile has none', async () => {
  let saved = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_PROFILE_MUTATION,
      variables: { data: { timezone: deviceTimezone } },
    },
    result: () => {
      saved = true;
      return { data: { updateUserProfile: { id: loggedUser.id } } };
    },
  });

  renderEnsureTimezone({ user: { ...loggedUser, timezone: undefined } });

  await waitFor(() => expect(saved).toBe(true));
  await waitFor(() =>
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: loggedUser.id, timezone: deviceTimezone }),
    ),
  );
});

it('does nothing when the profile already has a timezone', async () => {
  const scope = mockProfileUpdate();

  renderEnsureTimezone({
    user: { ...loggedUser, timezone: 'Europe/Amsterdam' },
  });

  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(scope.isDone()).toBe(false);
  expect(updateUser).not.toHaveBeenCalled();
});

it('does nothing when logged out', async () => {
  const scope = mockProfileUpdate();

  renderEnsureTimezone({ user: undefined, isLoggedIn: false });

  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(scope.isDone()).toBe(false);
  expect(updateUser).not.toHaveBeenCalled();
});
