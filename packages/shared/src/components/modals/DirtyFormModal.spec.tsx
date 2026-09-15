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

    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).not.toHaveBeenCalled();
    expect(saveButton).toHaveAttribute('aria-busy', 'true');
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();

    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave();
    });

    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });

  it('cannot be dismissed while an async save is in flight', async () => {
    let resolveSave: () => void;
    const onRequestClose = jest.fn();
    const onSave = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

    render(
      <DirtyFormModal
        isOpen
        onRequestClose={onRequestClose}
        onDiscard={jest.fn()}
        onSave={onSave}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await userEvent.keyboard('{Escape}');
    expect(onRequestClose).not.toHaveBeenCalled();
    expect(mockCloseModal).not.toHaveBeenCalled();

    await act(async () => {
      resolveSave();
    });

    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });

  it('closes after a rejected save so the form and its error stay visible', async () => {
    let rejectSave: (error: Error) => void;
    const savePromise = new Promise<void>((_, reject) => {
      rejectSave = reject;
    });
    const onSave = jest.fn(() => savePromise);

    renderModal(onSave);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await act(async () => {
      rejectSave(new Error('nope'));
      await savePromise.catch(() => undefined);
    });

    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });
});
