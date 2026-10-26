import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockDesktop, mockMatchMedia } from '../../../__tests__/helpers/media';
import { marketplaceSubmitUrl } from '../../graphql/plugins';
import type { FeedWidgetComponentProps } from './registry';
import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import type { FeedWidgetGalleryTips } from './FeedWidgetGallery';
import { FeedWidgetGallery } from './FeedWidgetGallery';
import { feedWidgetTips } from './tips';

// The widgets fetch their own data; the gallery only has to show the right
// one at the right size.
jest.mock('./components', () => {
  const actual = jest.requireActual('./components');
  const PreviewedWidget = ({ widget, size }: FeedWidgetComponentProps) => (
    <span>{`${widget.kind} widget, ${size}`}</span>
  );
  return { ...actual, getFeedWidgetComponent: () => PreviewedWidget };
});

const onAdd = jest.fn();
const onRequestClose = jest.fn();

const onRail = (kind: FeedWidgetKind): FeedWidget => ({
  id: `${kind}-1`,
  kind,
  size: FeedWidgetSize.Small,
});

const renderGallery = ({
  widgets = [],
  isFull = false,
  initialSize,
  tips,
  optOutReadingStreak = false,
  squads = [generateTestSquad()],
}: {
  widgets?: FeedWidget[];
  isFull?: boolean;
  initialSize?: FeedWidgetSize;
  tips?: FeedWidgetGalleryTips;
  optOutReadingStreak?: boolean;
  squads?: ReturnType<typeof generateTestSquad>[];
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, squads }}
      settings={{ optOutReadingStreak }}
    >
      <FeedWidgetGallery
        widgets={widgets}
        isFull={isFull}
        initialSize={initialSize}
        onAdd={onAdd}
        tips={tips}
        onRequestClose={onRequestClose}
      />
    </TestBootProvider>,
  );

const pick = (name: string) =>
  fireEvent.click(screen.getAllByRole('button', { name: new RegExp(name) })[0]);

const sizes = () =>
  within(screen.getByRole('radiogroup', { name: 'Size' }))
    .getAllByRole('radio')
    .map((radio) => radio.textContent);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('on desktop', () => {
  beforeEach(() => {
    mockDesktop();
  });

  it('shows the picked widget live, in the sizes it has', () => {
    renderGallery();

    pick('Notifications');

    expect(
      screen.getByRole('heading', { name: 'Add a widget' }),
    ).toBeInTheDocument();
    expect(sizes()).toEqual(['Small', 'Tall', 'Large']);
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Small preview' })).getByText(
        'notifications widget, small',
      ),
    ).toBeInTheDocument();
  });

  it('adds the widget in the size the reader picked', () => {
    renderGallery();

    pick('Notifications');
    fireEvent.click(screen.getByRole('radio', { name: 'Large' }));

    expect(screen.getByText('notifications widget, large')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add widget' }));
    expect(onAdd).toHaveBeenCalledWith(
      FeedWidgetKind.Notifications,
      FeedWidgetSize.Large,
    );
  });

  it('starts each widget at the size of the cell it was opened from', () => {
    renderGallery({ initialSize: FeedWidgetSize.Small });

    pick('Happening Now');

    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
  });

  it('says a kind already on the rail is added', () => {
    renderGallery({ widgets: [onRail(FeedWidgetKind.HappeningNow)] });

    pick('Happening Now');

    expect(screen.getByText('Already on your rail.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Added' })).toBeDisabled();
  });

  it('offers another of a kind the rail can hold more than once', () => {
    renderGallery({ widgets: [onRail(FeedWidgetKind.SquadUpdates)] });

    pick('Squad updates');
    fireEvent.click(screen.getByRole('button', { name: 'Add another' }));

    expect(onAdd).toHaveBeenCalledWith(
      FeedWidgetKind.SquadUpdates,
      FeedWidgetSize.Tall,
    );
  });

  it('explains why Streak cannot be added while streaks are off, with the fix', () => {
    renderGallery({ optOutReadingStreak: true });

    pick('Streak');

    expect(
      screen.getByText('Reading streaks are off in your settings.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Turn on streaks' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('settings/customization/streaks'),
    );
    expect(
      screen.queryByRole('button', { name: 'Add widget' }),
    ).not.toBeInTheDocument();
  });

  it('points a reader with no squads to one before Squad updates', () => {
    renderGallery({ squads: [] });

    pick('Squad updates');

    expect(
      screen.getByText('Join a squad first, then follow its new posts here.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Find a squad' })).toHaveAttribute(
      'href',
      expect.stringContaining('squads/discover'),
    );
  });

  it('says the rail is full instead of adding', () => {
    renderGallery({ isFull: true });

    pick('Notifications');

    expect(
      screen.getByText(
        'Your rail is full. Remove a widget to make room for this one.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add widget' })).toBeDisabled();
  });

  describe('daily.dev tips', () => {
    const tip = feedWidgetTips[0];

    it('says they are on while they show', () => {
      renderGallery({ tips: { tip, isShown: true } });

      pick('daily.dev tips');

      expect(screen.getByRole('button', { name: 'On' })).toBeDisabled();
      expect(screen.getByTestId('feedWidgetTip')).toBeInTheDocument();
    });

    it('brings them back once removed', () => {
      const onRestore = jest.fn();
      renderGallery({ tips: { tip, isShown: false, onRestore } });

      pick('daily.dev tips');
      fireEvent.click(screen.getByRole('button', { name: 'Show tips again' }));

      expect(onRestore).toHaveBeenCalled();
    });

    it('are not listed where they never show', () => {
      renderGallery();

      expect(
        screen.queryByRole('button', { name: /daily\.dev tips/ }),
      ).not.toBeInTheDocument();
    });
  });

  it('filters the list by search', () => {
    renderGallery();

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search widgets' }),
      {
        target: { value: 'saved' },
      },
    );

    expect(
      screen.getByRole('button', { name: /Bookmarks/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Notifications/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Suggested for you')).not.toBeInTheDocument();
  });

  it('says when no widget matches the search', () => {
    renderGallery();

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search widgets' }),
      {
        target: { value: 'kubernetes' },
      },
    );

    expect(
      screen.getByText('No widget matches “kubernetes”.'),
    ).toBeInTheDocument();
  });

  it('opens the marketplace in a new tab to create your own', () => {
    renderGallery();

    const link = screen.getByRole('link', { name: /Create your own widget/ });
    expect(link).toHaveAttribute('href', marketplaceSubmitUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('on a phone', () => {
  beforeEach(() => {
    mockMatchMedia();
  });

  it('lists every widget by category, then opens one to swipe its sizes', () => {
    renderGallery();

    expect(screen.queryByText('Suggested for you')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Create your own widget/ }),
    ).toHaveAttribute('target', '_blank');

    pick('Notifications');

    // A phone shows no Large, so it offers none.
    expect(
      screen.getByRole('group', { name: 'Small preview' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Tall preview' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'Large preview' }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show Tall' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add widget' }));
    expect(onAdd).toHaveBeenCalledWith(
      FeedWidgetKind.Notifications,
      FeedWidgetSize.Tall,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back to widgets' }));
    expect(
      screen.getByRole('searchbox', { name: 'Search widgets' }),
    ).toBeInTheDocument();
  });
});
