import React from 'react';
import { LoggedUser, updateProfile } from '@dailydotdev/shared/src/lib/user';
import Page from '../pages/register';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/user', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/user'),
  updateProfile: jest.fn(),
}));

const logout = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: {},
        replace: jest.fn(),
      } as unknown as NextRouter),
  );
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
        updateUser: jest.fn(),
        logout,
        tokenRefreshed: true,
      }}
    >
      <Page />
    </AuthContext.Provider>,
  );
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText('Your profile image');
  expect(el).toHaveAttribute('src', defaultUser.image);
});

it('should disable submit when form is invalid', () => {
  renderComponent();
  // eslint-disable-next-line testing-library/no-node-access
  const el = screen.getByText('Finish').parentElement;
  expect(el).toBeDisabled();
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  // eslint-disable-next-line testing-library/no-node-access
  const el = screen.getByText('Finish').parentElement;
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
    hashnode: null,
  });
});

it('should logout on button click', async () => {
  renderComponent();
  screen.getByText('Logout').click();
  await waitFor(() => expect(logout).toBeCalledTimes(1));
});

it('should enable submit when form is valid', () => {
  renderComponent({ username: 'idoshamun' });
  const el = screen.getByText('Finish');
  expect(el).toBeEnabled();
});

it('should set twitter to optional by default', async () => {
  renderComponent();
  const el = await screen.findByText('Twitter');
  expect(
    // eslint-disable-next-line testing-library/no-node-access
    el.parentElement.querySelector('input').getAttribute('required'),
  ).toBeFalsy();
});

it('should set twitter to required in author mode', async () => {
  mocked(useRouter).mockImplementation(
    () =>
      ({
        isFallback: false,
        query: { mode: 'author' },
      } as unknown as NextRouter),
  );
  renderComponent();
  const el = await screen.findByText('Twitter');
  // eslint-disable-next-line testing-library/no-node-access
  expect(el.parentElement.querySelector('input')).toBeRequired();
});
