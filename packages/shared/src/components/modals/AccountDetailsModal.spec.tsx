import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { LoggedUser, updateProfile } from '../../lib/user';
import AccountDetailsModal from './AccountDetailsModal';
import AuthContext from '../../contexts/AuthContext';
import user from '../../../__tests__/fixture/loggedUser';

jest.mock('../../lib/user', () => ({
  ...jest.requireActual('../../lib/user'),
  updateProfile: jest.fn(),
}));

const logout = jest.fn();
const onRequestClose = jest.fn();

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
          updateUser: jest.fn(),
          logout,
          tokenRefreshed: true,
        }}
      >
        <AccountDetailsModal
          isOpen
          onRequestClose={onRequestClose}
          ariaHideApp={false}
        />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText(`${user.username}'s profile`);
  expect(el).toHaveAttribute('data-src', user.image);
});

it('should submit information on button click', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue(user);
  screen.getByText('Save changes').click();
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    username: 'idoshamun',
    company: null,
    title: null,
    acceptedMarketing: false,
    bio: 'Software Engineer in the most amazing company in the globe',
    github: null,
    portfolio: null,
    timezone: 'Europe/London',
    twitter: null,
    hashnode: null,
  });
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should logout on button click', async () => {
  renderComponent();
  screen.getByText('Logout').click();
  await waitFor(() => expect(logout).toBeCalledTimes(1));
});
