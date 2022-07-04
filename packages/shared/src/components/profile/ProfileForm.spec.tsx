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
import { waitForNock } from '../../../__tests__/helpers/utilities';
import user from '../../../__tests__/fixture/loggedUser';

jest.mock('../../lib/user', () => ({
  ...jest.requireActual('../../lib/user'),
  updateProfile: jest.fn(),
}));

const onSuccessfulSubmit = jest.fn();
const updateUser = jest.fn();
const userTimezone = getUserDefaultTimezone();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  userUpdate: Partial<LoggedUser> = {},
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: { ...user, ...userUpdate },
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          closeLogin: jest.fn(),
          updateUser,
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <ProfileForm onSuccessfulSubmit={onSuccessfulSubmit} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should submit information', async () => {
  renderComponent();
  mocked(updateProfile).mockResolvedValue(user);
  fireEvent.submit(screen.getByTestId('form'));
  await waitForNock();
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    username: 'ido',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: 'Software Engineer in the most amazing company in the globe',
    github: null,
    portfolio: null,
    timezone: userTimezone,
    twitter: null,
    hashnode: null,
  });
  expect(onSuccessfulSubmit).toBeCalledWith(true);
  expect(updateUser).toBeCalledWith({ ...user });
});

it('should set optional fields on callback', async () => {
  renderComponent();
  mocked(updateProfile).mockResolvedValue({
    ...user,
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
    username: 'ido',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: 'Software Engineer in the most amazing company in the globe',
    github: 'idoshamun',
    portfolio: null,
    timezone: userTimezone,
    twitter: null,
    hashnode: null,
  });
  expect(onSuccessfulSubmit).toBeCalledWith(true);
  expect(updateUser).toBeCalledWith({
    ...user,
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
