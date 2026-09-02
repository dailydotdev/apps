import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ReadingReminderFeedHero from './ReadingReminderFeedHero';

describe('ReadingReminderFeedHero', () => {
  it('should render the PR-style hero with the cat illustration', () => {
    render(
      <ReadingReminderFeedHero
        title="Never miss a learning day"
        subtitle="Turn on your daily reading reminder and keep your routine."
      />,
    );

    expect(screen.getByText('Never miss a learning day')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Turn on your daily reading reminder and keep your routine.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Sleeping cat on laptop' }),
    ).toBeInTheDocument();
  });

  it('should handle enable and dismiss actions', () => {
    const onCtaClick = jest.fn();
    const onClose = jest.fn();

    render(
      <ReadingReminderFeedHero onCtaClick={onCtaClick} onClose={onClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enable reminder' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close banner' }));

    expect(onCtaClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
