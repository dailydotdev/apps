import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { LoggedUser } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import DeleteAccountModal from './DeleteAccountModal';

const deleteAccount = jest.fn();

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
        deleteAccount,
        tokenRefreshed: true,
      }}
    >
      <DeleteAccountModal
        isOpen
        deleteAccount={deleteAccount}
        onDelete={jest.fn()}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </AuthContext.Provider>,
  );
};

it('should close modal on cancel', async () => {
  renderComponent();
  const el = await screen.findByText('Cancel');
  el.click();
  expect(onRequestClose).toBeCalledTimes(1);
});

it('should send deleteAccount action', async () => {
  renderComponent();
  const el = await screen.findByText('Delete');
  el.click();
  await waitFor(() => expect(deleteAccount).toBeCalledTimes(1));
});
