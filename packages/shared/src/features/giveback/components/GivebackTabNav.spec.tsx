import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackTabNav } from './GivebackTabNav';

it('renders the tabs from the shared tab list', () => {
  render(<GivebackTabNav activeTab="actions" onSelect={jest.fn()} />);

  expect(screen.getByText('Take action')).toBeInTheDocument();
  expect(screen.getByText('Impact')).toBeInTheDocument();
  expect(screen.getByText('Causes')).toBeInTheDocument();
  expect(screen.getByText('FAQ')).toBeInTheDocument();
});

it('maps a tab click back to its id', () => {
  const onSelect = jest.fn();
  render(<GivebackTabNav activeTab="actions" onSelect={onSelect} />);

  fireEvent.click(screen.getByText('Causes'));

  expect(onSelect).toHaveBeenCalledWith('causes');
});
