import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import loggedUser from '../../__tests__/fixture/loggedUser';
import type { LoggedUser, PublicProfile, UserSocialLink } from '../lib/user';
import { getProfile } from '../lib/user';
import { mutateUserInfo } from '../graphql/users';
import useUserInfoForm from './useUserInfoForm';

const mockDisplayToast = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  getProfile: jest.fn(),
}));

jest.mock('../graphql/users', () => ({
  ...jest.requireActual('../graphql/users'),
  mutateUserInfo: jest.fn(),
}));

jest.mock('./useDirtyForm', () => ({
  useDirtyForm: jest.fn((_isDirty, options) => ({
    allowNavigation: jest.fn(),
    hasPendingNavigation: () => false,
    navigateToPending: jest.fn(),
    save: options.onSave,
  })),
}));

jest.mock('./useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;
const mockMutateUserInfo = mutateUserInfo as jest.MockedFunction<
  typeof mutateUserInfo
>;

const serverLinks: UserSocialLink[] = [
  { platform: 'github', url: 'https://github.com/server' },
];

const profile: PublicProfile = {
  id: loggedUser.id,
  name: loggedUser.name,
  username: loggedUser.username,
  bio: loggedUser.bio,
  createdAt: loggedUser.createdAt,
  image: loggedUser.image,
  permalink: loggedUser.permalink,
  premium: false,
  reputation: 0,
  socialLinks: serverLinks,
};

const renderUserInfoForm = (user: LoggedUser = loggedUser) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  const updateUser = jest.fn().mockResolvedValue(undefined);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
          isAuthReady: true,
          isLoggedIn: true,
          logout: jest.fn(),
          shouldShowLogin: false,
          showLogin: jest.fn(),
          tokenRefreshed: true,
          isTokenValid: true,
          updateUser,
          user,
        }}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  return {
    updateUser,
    ...renderHook(() => useUserInfoForm(), { wrapper }),
  };
};

const createDeferred = <T,>() => {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return {
    promise,
    resolve: resolve!,
  };
};

describe('useUserInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockResolvedValue(profile);
    mockMutateUserInfo.mockResolvedValue({
      ...loggedUser,
      socialLinks: [],
    });
  });

  it('does not send empty socialLinks before the profile query resolves', async () => {
    mockGetProfile.mockReturnValue(new Promise(() => undefined));
    mockMutateUserInfo.mockReturnValue(new Promise(() => undefined));

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });

    act(() => {
      result.current.save();
    });

    await waitFor(() => expect(mockMutateUserInfo).toHaveBeenCalled());
    expect(mockMutateUserInfo.mock.calls[0][0]).not.toHaveProperty(
      'socialLinks',
    );
  });

  it('merges a link added while the profile query is in flight with the server links', async () => {
    const deferred = createDeferred<PublicProfile>();
    mockGetProfile.mockReturnValue(deferred.promise);

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });
    const pendingLink = {
      platform: 'github',
      url: 'https://github.com/pending',
    };

    act(() => {
      result.current.methods.setValue('socialLinks', [pendingLink], {
        shouldDirty: true,
      });
    });

    await act(async () => {
      deferred.resolve(profile);
      await deferred.promise;
    });

    await waitFor(() =>
      expect(result.current.methods.getValues('socialLinks')).toEqual([
        ...serverLinks,
        pendingLink,
      ]),
    );
  });

  it('does not duplicate a link the server already had', async () => {
    const deferred = createDeferred<PublicProfile>();
    mockGetProfile.mockReturnValue(deferred.promise);

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });

    act(() => {
      result.current.methods.setValue(
        'socialLinks',
        [{ platform: 'github', url: 'https://github.com/Server/' }],
        { shouldDirty: true },
      );
    });

    await act(async () => {
      deferred.resolve(profile);
      await deferred.promise;
    });

    await waitFor(() =>
      expect(result.current.methods.getValues('socialLinks')).toEqual(
        serverLinks,
      ),
    );
  });

  it('omits socialLinks when the profile query never resolves, even if edited', async () => {
    mockGetProfile.mockReturnValue(new Promise(() => undefined));
    mockMutateUserInfo.mockReturnValue(new Promise(() => undefined));

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });

    act(() => {
      result.current.methods.setValue(
        'socialLinks',
        [{ platform: 'github', url: 'https://github.com/pending' }],
        { shouldDirty: true },
      );
    });

    act(() => {
      result.current.save();
    });

    await waitFor(() => expect(mockMutateUserInfo).toHaveBeenCalled());
    expect(mockMutateUserInfo.mock.calls[0][0]).not.toHaveProperty(
      'socialLinks',
    );
  });

  it('reports the links as loading until the profile query resolves', async () => {
    const deferred = createDeferred<PublicProfile>();
    mockGetProfile.mockReturnValue(deferred.promise);

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });

    expect(result.current.isSocialLinksLoading).toBe(true);
    expect(result.current.isSocialLinksError).toBe(false);

    await act(async () => {
      deferred.resolve(profile);
      await deferred.promise;
    });

    await waitFor(() =>
      expect(result.current.isSocialLinksLoading).toBe(false),
    );
  });

  it('reports an error when the profile query fails', async () => {
    mockGetProfile.mockRejectedValue(new Error('offline'));

    const { result } = renderUserInfoForm({
      ...loggedUser,
      socialLinks: undefined,
    });

    await waitFor(() => expect(result.current.isSocialLinksError).toBe(true));
    expect(result.current.isSocialLinksLoading).toBe(false);
  });

  it('surfaces a validation error message instead of the generic toast', async () => {
    mockMutateUserInfo.mockRejectedValue({
      response: {
        errors: [
          {
            message: 'Invalid URL',
            extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
          },
        ],
      },
    });

    const { result } = renderUserInfoForm();

    act(() => {
      result.current.save();
    });

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith('Invalid URL'),
    );
  });

  it('shows a fallback toast for non-JSON mutation errors', async () => {
    mockMutateUserInfo.mockRejectedValue({
      response: {
        errors: [{ message: 'value too long for type character varying(39)' }],
      },
    });

    const { result } = renderUserInfoForm();

    act(() => {
      result.current.save();
    });

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith('Failed to update profile'),
    );
  });

  it('shows a toast for mutation errors keyed to fields absent from the page', async () => {
    mockMutateUserInfo.mockRejectedValue({
      response: {
        errors: [
          { message: JSON.stringify({ github: 'github already exists' }) },
        ],
      },
    });

    const { result } = renderUserInfoForm();

    act(() => {
      result.current.save();
    });

    await waitFor(() =>
      expect(mockDisplayToast).toHaveBeenCalledWith('github already exists'),
    );
  });
});
