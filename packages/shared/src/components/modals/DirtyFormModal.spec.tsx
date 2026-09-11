import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DirtyFormModal from './DirtyFormModal';

const mockCloseModal = jest.fn();

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ closeModal: mockCloseModal }),
}));

const renderModal = (onSave: () => void | Promise<void>) =>
  render(
    <DirtyFormModal
      isOpen
      onRequestClose={jest.fn()}
      onDiscard={jest.fn()}
      onSave={onSave}
    />,
  );

describe('DirtyFormModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes immediately for a synchronous save', async () => {
    renderModal(jest.fn());

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it('stays open until an async save settles', async () => {
    let resolveSave: () => void;
    const onSave = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

    renderModal(onSave);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalled();
    expect(mockCloseModal).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();

    await act(async () => {
      resolveSave();
    });

    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });

  it('closes after a rejected save so the form and its error stay visible', async () => {
    const onSave = jest.fn(() => Promise.reject(new Error('nope')));

    renderModal(onSave);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });
});
