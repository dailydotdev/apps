import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { AnnouncementCarousel } from './AnnouncementCarousel';
import { AnnouncementCardVariant } from './types';
import type { AnnouncementItem } from './types';

const items: AnnouncementItem[] = [
  {
    id: 'a',
    variant: AnnouncementCardVariant.Default,
    badge: { label: 'New' },
    title: 'First card',
    description: 'first description',
    cta: { text: 'Go', onClick: jest.fn() },
  },
  {
    id: 'b',
    variant: AnnouncementCardVariant.Default,
    title: 'Second card',
  },
  {
    id: 'c',
    variant: AnnouncementCardVariant.Compact,
    title: 'Third card',
    href: '#',
  },
];

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

const getDots = () =>
  screen.getAllByRole('button', { name: /Show announcement/ });

describe('AnnouncementCarousel', () => {
  it('renders the first card and one dot per item', () => {
    render(<AnnouncementCarousel items={items} onDismiss={jest.fn()} />);

    expect(screen.getByText('First card')).toBeInTheDocument();
    expect(getDots()).toHaveLength(3);
  });

  it('renders nothing when there are no items', () => {
    const { container } = render(
      <AnnouncementCarousel items={[]} onDismiss={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('switches the active card when a dot is hovered', () => {
    render(<AnnouncementCarousel items={items} onDismiss={jest.fn()} />);

    fireEvent.mouseOver(getDots()[1]);

    expect(screen.getByText('Second card')).toBeInTheDocument();
    expect(screen.queryByText('First card')).not.toBeInTheDocument();
  });

  it('dismisses the active card and reports it to the parent', () => {
    const onDismiss = jest.fn();
    render(<AnnouncementCarousel items={items} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByTitle('Close'));
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(onDismiss).toHaveBeenCalledWith('a');
  });

  it('logs an impression once per card after a dwell, not on rapid scrub', () => {
    const onView = jest.fn();
    render(
      <AnnouncementCarousel
        items={items}
        onView={onView}
        onDismiss={jest.fn()}
      />,
    );

    // The first card settles and logs a single impression.
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(onView).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'a' }),
    );

    // Scrub past 'b' to 'c' without dwelling — only the settled card logs.
    fireEvent.mouseOver(getDots()[1]);
    fireEvent.mouseOver(getDots()[2]);
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(onView).toHaveBeenCalledTimes(2);
    expect(onView).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'c' }),
    );
  });
});
