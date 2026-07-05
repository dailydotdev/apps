import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import type { ContributionCause } from '../types';

const cause = (
  overrides: Partial<ContributionCause> & Pick<ContributionCause, 'id'>,
): ContributionCause => ({
  title: 'Open Source Fund',
  url: 'https://cause.test',
  description: 'Funds maintainers',
  category: 'Open source',
  logoUrl: null,
  ...overrides,
});

const renderGrid = (
  props: Partial<React.ComponentProps<typeof GivebackCauseSelection>> = {},
) =>
  render(
    <GivebackCauseSelection
      causes={[cause({ id: 'c1', title: 'Climate' })]}
      isLoading={false}
      selectedIds={new Set()}
      onToggle={jest.fn()}
      {...props}
    />,
  );

it('shows a skeleton while loading and no cause cards', () => {
  renderGrid({ isLoading: true, causes: [] });

  expect(
    screen.queryByRole('button', { name: /Select/ }),
  ).not.toBeInTheDocument();
});

it('renders cause cards and toggles on click', () => {
  const onToggle = jest.fn();
  renderGrid({ onToggle });

  fireEvent.click(screen.getByRole('button', { name: 'Select Climate' }));

  expect(onToggle).toHaveBeenCalledWith('c1');
});

it('reflects the selected state from selectedIds', () => {
  renderGrid({ selectedIds: new Set(['c1']) });

  expect(
    screen.getByRole('button', { name: 'Deselect Climate' }),
  ).toBeInTheDocument();
});

it('filters causes by category', () => {
  renderGrid({
    causes: [
      cause({ id: 'c1', title: 'Climate', category: 'Open source' }),
      cause({ id: 'c2', title: 'Schools', category: 'Education' }),
    ],
  });

  fireEvent.click(screen.getByRole('button', { name: 'Education' }));

  expect(screen.queryByText('Climate')).not.toBeInTheDocument();
  expect(screen.getByText('Schools')).toBeInTheDocument();
});
