import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import nock from 'nock';
import { waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJoinReferral } from './useJoinReferral';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { GET_REFERRING_USER_QUERY } from '../../graphql/users';
import defaultUser from '../../../__tests__/fixture/loggedUser';

describe('useJoinReferral hook', () => {
  const createWrapper = ({ user = null, client = new QueryClient() }) => {
    const Wrapper = ({ children }) => (
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={user}
          getRedirectUri={jest.fn()}
          updateUser={jest.fn()}
          tokenRefreshed={false}
          firstLoad={false}
        >
          {children}
        </AuthContextProvider>
      </QueryClientProvider>
    );

    return Wrapper;
  };

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
    jest.clearAllMocks();
    nock.cleanAll();
  });

  it('should set referral cookie', () => {
    mocked(useRouter).mockImplementation(
      () =>
        ({
          query: {
            cid: 'squad',
            userid: '1',
          },
        } as unknown as NextRouter),
    );

    renderHook(() => useJoinReferral(), {
      wrapper: createWrapper({}),
    });

    expect(document.cookie).toBe(
      `join_referral=${encodeURIComponent(
        '1:squad',
      )}; max-age=31536000; path=/; samesite=lax; secure`,
    );
  });

  it('should not set referral cookie if params missing', () => {
    mocked(useRouter).mockImplementation(
      () =>
        ({
          query: {},
        } as unknown as NextRouter),
    );

    renderHook(() => useJoinReferral(), {
      wrapper: createWrapper({}),
    });

    expect(document.cookie).toBe('');
  });

  it('should expire cookie if referring user id can not be found', async () => {
    mocked(useRouter).mockImplementation(
      () =>
        ({
          query: {
            cid: 'squad',
            userid: '1',
          },
        } as unknown as NextRouter),
    );

    mockGraphQL({
      request: {
        query: GET_REFERRING_USER_QUERY,
        variables: { id: '1' },
      },
      result: {
        errors: [
          {
            message: 'user not found',
            extensions: { code: 'FORBIDDEN' },
          },
        ],
      },
    });

    renderHook(() => useJoinReferral(), {
      wrapper: createWrapper({}),
    });

    await waitFor(() =>
      expect(document.cookie).toBe(`join_referral=expired; max-age=0; path=/`),
    );
  });

  it('should not set cookie if logger user id is the same as referred user id', async () => {
    mocked(useRouter).mockImplementation(
      () =>
        ({
          query: {
            cid: 'squad',
            userid: '1',
          },
        } as unknown as NextRouter),
    );

    renderHook(() => useJoinReferral(), {
      wrapper: createWrapper({
        user: {
          ...defaultUser,
          id: '1',
        },
      }),
    });

    expect(document.cookie).toBe('');
  });
});
