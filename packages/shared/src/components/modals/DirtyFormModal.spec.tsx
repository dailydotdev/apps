import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DirtyFormModal from './DirtyFormModal';

const mockCloseModal = jest.fn();

jest.mock('../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ closeModal: mockCloseModal }),
}));

const createDeferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: () => resolve(),
    reject: (error: Error) => reject(error),
  };
};

const renderComponent = (onSave: () => void | Promise<void>) =>
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
    mockCloseModal.mockClear();
  });

  it('closes immediately for synchronous save handlers', async () => {
    const onSave = jest.fn();
    renderComponent(onSave);

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal pending until an async save fails', async () => {
    const deferred = createDeferred();
    const onSave = jest.fn(() => deferred.promise);
    renderComponent(onSave);

    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(saveButton).toHaveAttribute('aria-busy', 'true');
    expect(saveButton).toBeDisabled();
    expect(mockCloseModal).not.toHaveBeenCalled();

    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.reject(new Error('failed'));
      await deferred.promise.catch(() => undefined);
    });

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});
