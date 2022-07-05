import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import React from 'react';
import AuthContext from '../../contexts/AuthContext';
import DeleteAccountModal from './DeleteAccountModal';
import user from '../../../__tests__/fixture/loggedUser';

const deleteAccount = jest.fn();

const onRequestClose = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (): RenderResult => {
  return render(
    <AuthContext.Provider
      value={{
        user,
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
