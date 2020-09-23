import React from 'react';
import { LoggedUser, updateProfile, changeProfileImage } from '../lib/user';
import Page from '../pages/register';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import AuthContext from '../components/AuthContext';
import { mocked } from 'ts-jest/utils';

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  updateProfile: jest.fn(),
  changeProfileImage: jest.fn(),
}));

const logout = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
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
        showProfile: jest.fn(),
        logout,
      }}
    >
      <Page />
    </AuthContext.Provider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText('Your profile image') as HTMLImageElement;
  expect(el.src).toEqual(defaultUser.image);
});

it('should show github provider information', () => {
  renderComponent();
  const el = screen.getByText('via GitHub');
  expect(el).toBeInTheDocument();
});

it('should show google provider information', () => {
  renderComponent({ providers: ['google'] });
  const el = screen.getByText('via Google');
  expect(el).toBeInTheDocument();
});

it('should upload the new image profile image', async () => {
  renderComponent();
  mocked(changeProfileImage).mockResolvedValue({
    ...defaultUser,
    image: 'https://daily.dev/new.png',
  });
  const input = screen.getByTestId('profileImage') as HTMLInputElement;
  const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
  const readAsDataURL = jest.fn();
  Object.defineProperty(global, 'FileReader', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      readAsDataURL,
    })),
  });
  Object.defineProperty(input, 'files', {
    value: [file],
  });
  fireEvent.change(input);
  await waitFor(() => expect(readAsDataURL).toBeCalledTimes(1));
  expect(changeProfileImage).toBeCalledWith(file);
  const el = screen.getByAltText('Your profile image') as HTMLImageElement;
  await waitFor(() => expect(el.src).toEqual('https://daily.dev/new.png'));
});

it('should disable submit when form is invalid', () => {
  renderComponent();
  const el = screen.getByText('Finish');
  expect(el).toBeDisabled();
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  const el = screen.getByText('Finish');
  expect(el).toBeEnabled();
});

it('should submit information on button click', async () => {
  renderComponent({ username: 'idoshamun' });
  mocked(updateProfile).mockResolvedValue(defaultUser);
  screen.getByText('Finish').click();
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
  screen.getByText('Finish').click();
  await waitFor(() => expect(updateProfile).toBeCalledTimes(1));
  const el = screen.getByRole('alert');
  expect(el).toHaveTextContent('This email is already used');
});

it('should logout on button click', async () => {
  renderComponent();
  screen.getByText('Logout').click();
  await waitFor(() => expect(logout).toBeCalledTimes(1));
});
