import React from 'react';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useViewSize: () => false,
}));

const getOverlay = (name: string): HTMLElement | null =>
  screen.getByRole('dialog', { name }).parentElement;

const renderModals = (modals: { name: string; isOpen?: boolean }[]) => (
  <>
    {modals.map(({ name, isOpen = true }) => (
      <Modal key={name} isOpen={isOpen} contentLabel={name} ariaHideApp={false}>
        {name}
      </Modal>
    ))}
  </>
);

describe('Modal enter animation', () => {
  it('should ease in a modal opening on its own', () => {
    render(renderModals([{ name: 'first' }]));

    expect(getOverlay('first')).toHaveClass('modal-enter');
  });

  it('should open instantly over a modal that is already open', () => {
    const { rerender } = render(renderModals([{ name: 'first' }]));
    rerender(renderModals([{ name: 'first' }, { name: 'second' }]));

    expect(getOverlay('first')).toHaveClass('modal-enter');
    expect(getOverlay('second')).not.toHaveClass('modal-enter');
  });

  it('should open instantly when it replaces another modal', () => {
    const { rerender } = render(renderModals([{ name: 'first' }]));
    rerender(renderModals([{ name: 'second' }]));

    expect(
      screen.queryByRole('dialog', { name: 'first' }),
    ).not.toBeInTheDocument();
    expect(getOverlay('second')).not.toHaveClass('modal-enter');
  });

  it('should ease in again once every modal has closed', () => {
    const { rerender } = render(renderModals([{ name: 'first' }]));
    rerender(renderModals([{ name: 'first', isOpen: false }]));
    rerender(renderModals([{ name: 'first' }]));

    expect(getOverlay('first')).toHaveClass('modal-enter');
  });
});
