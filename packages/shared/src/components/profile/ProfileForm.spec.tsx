import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mocked } from 'ts-jest/utils';
import { LoggedUser, updateProfile } from '../../lib/user';
import ProfileForm from './ProfileForm';
import AuthContext from '../../contexts/AuthContext';
import { getUserDefaultTimezone } from '../../lib/timezones';
import {
  FeedSettings,
  UPDATE_FEED_FILTERS_MUTATION,
} from '../../graphql/feedSettings';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { updateLocalFeedSettings } from '../../hooks/useFeedSettings';
import { waitForNock } from '../../../__tests__/helpers/utilities';

jest.mock('../../lib/user', () => ({
  ...jest.requireActual('../../lib/user'),
  updateProfile: jest.fn(),
}));

const setDisableSubmit = jest.fn();
const onSuccessfulSubmit = jest.fn();
const updateUser = jest.fn();
const userTimezone = getUserDefaultTimezone();

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};

const defaultFeedSettings: FeedSettings = {
  advancedSettings: [{ id: 1, enabled: false }],
  blockedTags: ['javascript'],
  includeTags: ['react'],
  excludeSources: [{ id: 'test', name: 'Source', image: 'a.b.c' }],
};

const createUpdateFeedFiltersMock = (
  mock: ReturnType<typeof jest.fn>,
  { advancedSettings, ...rest }: FeedSettings = defaultFeedSettings,
) => {
  const variables = { filters: rest, settings: advancedSettings };

  return {
    request: {
      query: UPDATE_FEED_FILTERS_MUTATION,
      variables,
    },
    result: () => {
      mock(variables);
      return { data: { _: true } };
    },
  };
};

const renderComponent = (user: Partial<LoggedUser> = {}): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: { ...defaultUser, ...user },
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          closeLogin: jest.fn(),
          updateUser,
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <ProfileForm
          setDisableSubmit={setDisableSubmit}
          onSuccessfulSubmit={onSuccessfulSubmit}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should disable submit when form is invalid', () => {
  renderComponent();
  expect(setDisableSubmit).toBeCalledWith(true);
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  expect(setDisableSubmit).toBeCalledWith(false);
});

it('should submit information', async () => {
  const updateFeedSettings = jest.fn();
  const expected: FeedSettings = {
    ...defaultFeedSettings,
    includeTags: [...defaultFeedSettings.includeTags, 'webdev'],
  };
  const { advancedSettings, ...filters } = expected;
  renderComponent({ username: 'idoshamun' });
  updateLocalFeedSettings(expected);
  mockGraphQL(createUpdateFeedFiltersMock(updateFeedSettings, expected));
  mocked(updateProfile).mockResolvedValue(defaultUser);
  fireEvent.submit(screen.getByTestId('form'));
  await waitForNock();
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    username: 'idoshamun',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: null,
    github: null,
    portfolio: null,
    timezone: userTimezone,
    twitter: null,
    hashnode: null,
  });
  expect(updateFeedSettings).toBeCalledWith({
    settings: advancedSettings,
    filters,
  });
  expect(onSuccessfulSubmit).toBeCalledWith(true);
  expect(updateUser).toBeCalledWith({ ...defaultUser, username: 'idoshamun' });
});

it('should set optional fields on callback', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue({
    ...defaultUser,
    github: 'idoshamun',
  });
  fireEvent.input(screen.getByLabelText('GitHub'), {
    target: { value: 'idoshamun' },
  });
  fireEvent.submit(screen.getByTestId('form'));
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    username: 'idoshamun',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: null,
    github: 'idoshamun',
    portfolio: null,
    timezone: userTimezone,
    twitter: null,
    hashnode: null,
  });
  expect(onSuccessfulSubmit).toBeCalledWith(true);
  expect(updateUser).toBeCalledWith({
    ...defaultUser,
    username: 'idoshamun',
    github: 'idoshamun',
  });
});

it('should show server error', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue({
    error: true,
    code: 1,
    message: '',
    field: 'email',
    reason: 'email already exists',
  });
  fireEvent.submit(screen.getByTestId('form'));
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  const el = await screen.findByRole('alert');
  expect(el).toHaveTextContent('This email is already used');
});
