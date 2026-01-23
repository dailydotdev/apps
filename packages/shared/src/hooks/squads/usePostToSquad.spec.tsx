import React from 'react';
import nock from 'nock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { usePostToSquad } from './usePostToSquad';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { SUBMIT_EXTERNAL_LINK_MUTATION } from '../../graphql/posts';
import { NotificationsContextProvider } from '../../contexts/NotificationsContext';

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={loggedUser}
          updateUser={jest.fn()}
          getRedirectUri={jest.fn()}
          tokenRefreshed
        >
          <NotificationsContextProvider>
            {children}
          </NotificationsContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    );
  };
};

describe('usePostToSquad', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('onSubmitLink error handling', () => {
    it('should display toast when rate limited', async () => {
      const rateLimitedError = {
        data: { submitExternalLink: null },
        errors: [
          {
            message: 'Take a break. You already posted enough',
            extensions: { code: 'RATE_LIMITED' },
          },
        ],
      };

      mockGraphQL({
        request: {
          query: SUBMIT_EXTERNAL_LINK_MUTATION,
          variables: {
            url: 'https://example.com/article',
            sourceId: 'squad-123',
          },
        },
        result: rateLimitedError,
      });

      const onError = jest.fn();
      const { result } = renderHook(
        () =>
          usePostToSquad({
            onError,
          }),
        { wrapper: createWrapper() },
      );

      await act(async () => {
        try {
          await result.current.onSubmitPost({
            url: 'https://example.com/article',
            sourceId: 'squad-123',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should display default error message for non-rate-limit errors', async () => {
      const genericError = {
        data: { submitExternalLink: null },
        errors: [
          {
            message: 'Something went wrong',
            extensions: { code: 'INTERNAL_ERROR' },
          },
        ],
      };

      mockGraphQL({
        request: {
          query: SUBMIT_EXTERNAL_LINK_MUTATION,
          variables: {
            url: 'https://example.com/article',
            sourceId: 'squad-123',
          },
        },
        result: genericError,
      });

      const onError = jest.fn();
      const { result } = renderHook(
        () =>
          usePostToSquad({
            onError,
          }),
        { wrapper: createWrapper() },
      );

      await act(async () => {
        try {
          await result.current.onSubmitPost({
            url: 'https://example.com/article',
            sourceId: 'squad-123',
          });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });
});
