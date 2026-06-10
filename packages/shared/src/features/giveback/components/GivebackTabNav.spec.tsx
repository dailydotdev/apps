import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackTabNav } from './GivebackTabNav';

it('renders the tabs and marks the active one selected', () => {
  render(<GivebackTabNav activeTab="actions" onSelect={jest.fn()} />);

  const tablist = screen.getByRole('tablist', { name: 'Giveback sections' });
  expect(tablist).toBeInTheDocument();

  expect(screen.getByRole('tab', { name: 'Take action' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByRole('tab', { name: 'Impact' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});

it('selects a tab on click', () => {
  const onSelect = jest.fn();
  render(<GivebackTabNav activeTab="actions" onSelect={onSelect} />);

  fireEvent.click(screen.getByRole('tab', { name: 'Campaign' }));

  expect(onSelect).toHaveBeenCalledWith('why');
});
