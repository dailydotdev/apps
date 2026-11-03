import React from 'react';
import { render, screen } from '@testing-library/react';
import { PicksShareCard } from '../components/image-generator/ShareCard';

const author = { name: 'Ada Lovelace', image: 'https://daily.dev/ada.jpg' };

it('should render the author, label, week and titles', () => {
  render(
    <PicksShareCard data={{ author, week: 45, titles: ['First', 'Second'] }} />,
  );

  expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  expect(screen.getByText('Weekly picks')).toBeInTheDocument();
  expect(screen.getByText('· week 45')).toBeInTheDocument();
  expect(screen.getByText('First')).toBeInTheDocument();
  expect(screen.getByText('Second')).toBeInTheDocument();
  expect(screen.queryByText(/more/)).not.toBeInTheDocument();
});

it('should show only three titles and a count of the rest', () => {
  render(
    <PicksShareCard
      data={{
        author,
        week: 1,
        titles: ['One', 'Two', 'Three', 'Four', 'Five'],
      }}
    />,
  );

  expect(screen.getByText('Three')).toBeInTheDocument();
  expect(screen.queryByText('Four')).not.toBeInTheDocument();
  expect(screen.getByText('+2 more')).toBeInTheDocument();
});
