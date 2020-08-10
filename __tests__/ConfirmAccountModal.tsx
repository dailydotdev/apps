import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import ConfirmAccountModal, { Props } from '../components/ConfirmAccountModal';
import AuthContext from '../components/AuthContext';
import { LoggedUser, updateProfile } from '../lib/user';

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  updateProfile: jest.fn(),
}));

const profiledUpdated = jest.fn();

beforeEach(() => {
  mocked(updateProfile).mockReset();
  profiledUpdated.mockReset();
});

const defaultUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
};

const renderComponent = (
  props: Partial<Props> = {},
  user: Partial<LoggedUser> = {},
): RenderResult => {
  const defaultProps: Props = {
    isOpen: true,
    profiledUpdated,
    ariaHideApp: false,
  };

  return render(
    <AuthContext.Provider
      value={{
        user: { ...defaultUser, ...user },
        shouldShowLogin: false,
        showLogin: jest.fn(),
      }}
    >
      <ConfirmAccountModal {...defaultProps} {...props} />
    </AuthContext.Provider>,
  );
};

it('should enable submit when form is valid', () => {
  renderComponent();
  const el = screen.getByText('Confirm');
  expect(el.getAttribute('disabled')).toBeFalsy();
});

it('should submit information on button click', async () => {
  renderComponent();
  mocked(updateProfile).mockResolvedValue(defaultUser);
  screen.getByText('Confirm').click();
  await waitFor(() => expect(profiledUpdated).toBeCalledWith(defaultUser));
  expect(updateProfile).toBeCalledWith({
    name: 'Ido Shamun',
    email: 'ido@acme.com',
    company: null,
    title: null,
  });
});

it('should show server error', async () => {
  renderComponent();
  mocked(updateProfile).mockResolvedValue({
    error: true,
    code: 1,
    message: '',
  });
  screen.getByText('Confirm').click();
  await waitFor(() =>
    expect(updateProfile).toBeCalledWith({
      name: 'Ido Shamun',
      email: 'ido@acme.com',
      company: null,
      title: null,
    }),
  );
  expect(profiledUpdated).toBeCalledTimes(0);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
