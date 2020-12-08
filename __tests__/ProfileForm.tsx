import React from 'react';
import { LoggedUser, updateProfile } from '../lib/user';
import ProfileForm from '../components/profile/ProfileForm';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import AuthContext from '../components/AuthContext';
import { mocked } from 'ts-jest/utils';

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  updateProfile: jest.fn(),
}));

const setDisableSubmit = jest.fn();
const onSuccessfulSubmit = jest.fn();
const updateUser = jest.fn();

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

const renderComponent = (user: Partial<LoggedUser> = {}): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user: { ...defaultUser, ...user },
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout: jest.fn(),
        updateUser,
      }}
    >
      <ProfileForm
        setDisableSubmit={setDisableSubmit}
        onSuccessfulSubmit={onSuccessfulSubmit}
      />
    </AuthContext.Provider>,
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
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue(defaultUser);
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
    github: null,
    portfolio: null,
    twitter: null,
  });
  expect(onSuccessfulSubmit).toBeCalledTimes(1);
  expect(updateUser).toBeCalledWith({ ...defaultUser, username: 'idoshamun' });
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
