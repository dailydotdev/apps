import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { LoggedUser, updateProfile } from '../../lib/user';
import AccountDetailsModal from './AccountDetailsModal';
import AuthContext from '../../contexts/AuthContext';

jest.mock('../../lib/user', () => ({
  ...jest.requireActual('../../lib/user'),
  updateProfile: jest.fn(),
}));

const logout = jest.fn();
const onRequestClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const defaultUser = {
  id: 'u1',
  username: 'idoshamun',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};

const renderComponent = (user: Partial<LoggedUser> = {}): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user: { ...defaultUser, ...user },
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
    </AuthContext.Provider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText(`idoshamun's profile`);
  expect(el).toHaveAttribute('data-src', defaultUser.image);
});

it('should disable submit when form is invalid', async () => {
  renderComponent({ username: null });
  // eslint-disable-next-line testing-library/no-node-access
  const el = screen.getByText('Save changes').parentElement;
  expect(el).toBeDisabled();
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  // eslint-disable-next-line testing-library/no-node-access
  const el = screen.getByText('Save changes').parentElement;
  expect(el).toBeEnabled();
});

it('should submit information on button click', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue(defaultUser);
  screen.getByText('Save changes').click();
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
