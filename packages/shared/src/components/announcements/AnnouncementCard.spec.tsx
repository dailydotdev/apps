import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementCardVariant } from './types';

describe('AnnouncementCard', () => {
  it('renders the compact variant as a link and fires onClick', () => {
    const onClick = jest.fn();
    render(
      <AnnouncementCard
        variant={AnnouncementCardVariant.Compact}
        title="Keyboard shortcuts are here"
        href="/settings"
        onClick={onClick}
      />,
    );

    const link = screen.getByRole('link', {
      name: /keyboard shortcuts are here/i,
    });
    expect(link).toHaveAttribute('href', '/settings');

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders title, description, badge and CTA for the default variant', () => {
    const onCtaClick = jest.fn();
    render(
      <AnnouncementCard
        variant={AnnouncementCardVariant.Default}
        badge={{ label: 'Updated' }}
        title="Smarter custom feeds"
        description="Custom feeds now learn from what you read."
        cta={{ text: 'See what changed', onClick: onCtaClick }}
      />,
    );

    expect(screen.getByText('Smarter custom feeds')).toBeInTheDocument();
    expect(
      screen.getByText('Custom feeds now learn from what you read.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'See what changed' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('renders a dismiss control when onClose is provided and fires it', () => {
    const onClose = jest.fn();
    render(
      <AnnouncementCard
        variant={AnnouncementCardVariant.Default}
        title="Smarter custom feeds"
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByTitle('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a cover image for the cover variant', () => {
    const { container } = render(
      <AnnouncementCard
        variant={AnnouncementCardVariant.Cover}
        image="https://media.daily.dev/cover.png"
        title="Introducing Clips"
        onClose={() => undefined}
      />,
    );

    // Decorative cover (alt=""), so it has no accessible role — query the
    // element directly.
    // eslint-disable-next-line testing-library/no-container
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://media.daily.dev/cover.png');
  });
});
