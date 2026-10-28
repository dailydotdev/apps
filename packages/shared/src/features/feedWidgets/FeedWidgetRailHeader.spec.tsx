import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockMatchMedia } from '../../../__tests__/helpers/media';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { QuestStatus } from '../../graphql/quests';
import { FeedWidgetRailHeader } from './FeedWidgetRailHeader';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../hooks/useQuestDashboard', () => ({
  useQuestDashboard: jest.fn(),
}));

const mockWidth = (width: number) =>
  mockMatchMedia((query) => {
    const [, min] = /min-width:\s*(\d+)px/.exec(query) ?? [];
    return !!min && Number(min) <= width;
  });

const introQuests = (statuses: QuestStatus[]) => ({
  data: {
    intro: statuses.map((status, index) => ({
      userQuestId: `intro-${index}`,
      status,
      claimable: false,
    })),
  },
});

const renderHeader = ({
  isEditing = false,
  isPhone = false,
  user = loggedUser,
}: {
  isEditing?: boolean;
  isPhone?: boolean;
  user?: LoggedUser;
} = {}) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user }}>
      <FeedWidgetRailHeader
        isEditing={isEditing}
        isPhone={isPhone}
        showArrows={!isPhone}
        edges={{ start: false, end: true }}
        onScroll={jest.fn()}
        onToggleEditing={jest.fn()}
        onAdd={jest.fn()}
        onHide={jest.fn()}
      />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockWidth(1360);
  jest
    .mocked(useRouter)
    .mockImplementation(
      () => ({ pathname: '/', query: {}, route: '/' } as unknown as NextRouter),
    );
  jest
    .mocked(useQuestDashboard)
    .mockReturnValue(
      introQuests([
        QuestStatus.Claimed,
        QuestStatus.InProgress,
      ]) as unknown as ReturnType<typeof useQuestDashboard>,
    );
});

describe('FeedWidgetRailHeader', () => {
  it('carries the page’s actions, then the gear left of the arrows', () => {
    renderHeader();

    expect(
      screen.getByRole('button', { name: /Open introduction quests \(1\/2\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get Plus' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New post' })).toBeInTheDocument();
    const gear = screen.getByRole('button', { name: 'Customize widgets' });
    const left = screen.getByRole('button', { name: 'Scroll widgets left' });
    expect(
      // eslint-disable-next-line no-bitwise
      gear.compareDocumentPosition(left) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('keeps New post the one filled button, the rest Tertiary Small', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'New post' })).toHaveClass(
      'btn-primary',
    );
    const plus = screen.getByRole('link', { name: 'Get Plus' });
    expect(plus).toHaveClass('btn-tertiary', 'h-8');
    expect(plus).not.toHaveClass('btn-primary-bacon');
    expect(plus.querySelector('svg')).toHaveClass('text-accent-bacon-default');
    expect(
      screen.getByRole('button', { name: /Open introduction quests/ }),
    ).toHaveClass('btn-tertiary', 'h-8');
    expect(screen.getByTestId('attention-dot')).toBeInTheDocument();
    expect(
      screen.queryByTestId('intro-quest-attention-badge'),
    ).not.toBeInTheDocument();
  });

  it('names Getting started where the row has room', () => {
    mockWidth(1668);
    renderHeader();

    expect(screen.getByText('Getting started · 1/2')).toBeInTheDocument();
  });

  it('leaves Getting started out once the intro quests are done', () => {
    jest
      .mocked(useQuestDashboard)
      .mockReturnValue(
        introQuests([
          QuestStatus.Claimed,
          QuestStatus.Claimed,
        ]) as unknown as ReturnType<typeof useQuestDashboard>,
      );
    renderHeader();

    expect(
      screen.queryByRole('button', { name: /Open introduction quests/ }),
    ).not.toBeInTheDocument();
  });

  it('offers Plus to readers without it only', () => {
    renderHeader({ user: { ...loggedUser, isPlus: true } });

    expect(
      screen.queryByRole('link', { name: 'Get Plus' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New post' })).toBeInTheDocument();
  });

  it('turns Get Plus and New post into icons on tablet', () => {
    mockWidth(768);
    renderHeader();

    expect(screen.getByRole('link', { name: 'Get Plus' })).toBeInTheDocument();
    expect(screen.queryByText('Get Plus')).not.toBeInTheDocument();
    expect(screen.queryByText('New post')).not.toBeInTheDocument();
  });

  it('steps the page’s actions aside in edit mode', () => {
    renderHeader({ isEditing: true });

    expect(
      screen.getByText('Drag to move, or drag a corner to resize'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'New post' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Get Plus' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Customize widgets' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hide widgets' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'New widget' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New widget' })).toHaveClass(
      'btn-tertiary',
    );
    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass(
      'btn-primary',
    );
    expect(
      screen.getByRole('button', { name: 'Scroll widgets right' }),
    ).toBeInTheDocument();
  });

  it('keeps phones to the greeting and the gear', () => {
    renderHeader({ isPhone: true });

    expect(
      screen.getByRole('button', { name: 'Customize widgets' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'New post' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Get Plus' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Scroll widgets left' }),
    ).not.toBeInTheDocument();
  });
});
