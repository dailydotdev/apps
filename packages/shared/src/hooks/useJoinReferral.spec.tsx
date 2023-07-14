import React from 'react';
import { renderHook } from '@testing-library/preact-hooks';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import nock from 'nock';
import { waitFor } from '@testing-library/preact';
import { useJoinReferral } from './useJoinReferral';
import { AuthContextProvider } from '../contexts/AuthContext';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { GET_REFERRING_USER_QUERY } from '../graphql/users';

describe('useJoinReferral hook', () => {
  beforeAll(() => {
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
      wrapper: ({ children }) => (
        <AuthContextProvider
          user={null}
          getRedirectUri={jest.fn()}
          updateUser={jest.fn()}
          tokenRefreshed={false}
        >
          {children}
        </AuthContextProvider>
      ),
    });

    expect(document.cookie).toBe(
      `join_referral=${encodeURIComponent(
        '1:squad',
      )}; max-age=31536000; samesite=lax; secure`,
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
      wrapper: ({ children }) => (
        <AuthContextProvider
          user={null}
          getRedirectUri={jest.fn()}
          updateUser={jest.fn()}
          tokenRefreshed={false}
        >
          {children}
        </AuthContextProvider>
      ),
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
      wrapper: ({ children }) => (
        <AuthContextProvider
          user={null}
          getRedirectUri={jest.fn()}
          updateUser={jest.fn()}
          tokenRefreshed={false}
        >
          {children}
        </AuthContextProvider>
      ),
    });

    await waitFor(() =>
      expect(document.cookie).toBe(
        `join_referral=${encodeURIComponent(
          '1:squad',
        )}; max-age=0; samesite=lax; secure`,
      ),
    );
  });
});
