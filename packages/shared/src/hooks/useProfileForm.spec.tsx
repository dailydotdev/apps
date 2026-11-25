import React from 'react';
import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { UPDATE_USER_PROFILE_MUTATION } from '../graphql/users';
import useProfileForm from './useProfileForm';

const updateUser = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

it('keeps the confirmed user the server returns after a save', async () => {
  const data = { name: 'Ada', username: 'ada' };
  mockGraphQL({
    request: { query: UPDATE_USER_PROFILE_MUTATION, variables: { data } },
    result: {
      data: {
        updateUserProfile: { id: loggedUser.id, ...data, infoConfirmed: true },
      },
    },
  });
  const client = new QueryClient();
  const { result } = renderHook(() => useProfileForm(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestBootProvider
        client={client}
        auth={{ updateUser, user: { ...loggedUser, infoConfirmed: false } }}
      >
        {children}
      </TestBootProvider>
    ),
  });

  act(() => result.current.updateUserProfile(data));

  await waitFor(() =>
    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ ...data, infoConfirmed: true }),
    ),
  );
});
