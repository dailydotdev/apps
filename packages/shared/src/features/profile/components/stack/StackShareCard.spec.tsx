import React from 'react';
import { render, screen } from '@testing-library/react';
import type { PublicProfile } from '../../../../lib/user';
import type { UserStack } from '../../../../graphql/user/userStack';
import { StackShareCard } from './StackShareCard';

const user = {
  id: 'u1',
  name: 'Chris Bongers',
  username: 'dailydevtips',
  image: 'https://daily.dev/avatar.png',
} as PublicProfile;

const buildItem = (overrides: Partial<UserStack>): UserStack => ({
  id: `item-${Math.random()}`,
  tool: { id: 't1', title: 'TypeScript', faviconUrl: null },
  section: 'Primary',
  position: 0,
  startedAt: null,
  icon: null,
  title: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('StackShareCard', () => {
  it('renders user identity and grouped sections', () => {
    render(
      <StackShareCard
        user={user}
        items={[
          buildItem({ section: 'Primary' }),
          buildItem({
            section: 'Learning',
            tool: { id: 't2', title: 'Rust', faviconUrl: null },
          }),
        ]}
      />,
    );

    expect(screen.getByText('Chris Bongers')).toBeInTheDocument();
    expect(screen.getByText('@dailydevtips · my stack')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('caps output at three sections and four tools per section', () => {
    const items = [
      ...['Primary', 'Hobby', 'Learning', 'Past'].map((section) =>
        buildItem({ section }),
      ),
      ...Array.from({ length: 6 }, (_, index) =>
        buildItem({
          section: 'Primary',
          tool: {
            id: `extra-${index}`,
            title: `Tool ${index}`,
            faviconUrl: null,
          },
        }),
      ),
    ];

    render(<StackShareCard user={user} items={items} />);

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Learning')).toBeInTheDocument();
    expect(screen.queryByText('Past')).not.toBeInTheDocument();
    expect(
      screen.getByText('Primary').nextElementSibling?.children,
    ).toHaveLength(4);
  });

  it('derives years shipping from the earliest startedAt', () => {
    const currentYear = new Date().getFullYear();

    render(
      <StackShareCard
        user={user}
        items={[
          buildItem({ startedAt: `${currentYear - 8}-03-01` }),
          buildItem({
            section: 'Hobby',
            startedAt: `${currentYear - 2}-01-01`,
          }),
        ]}
      />,
    );

    expect(screen.getByText('8 yrs')).toBeInTheDocument();
    expect(
      screen.getByText(`'${String(currentYear - 8).slice(-2)}`),
    ).toBeInTheDocument();
  });

  it('hides years shipping when no item has startedAt', () => {
    render(<StackShareCard user={user} items={[buildItem({})]} />);

    expect(screen.queryByText(/yrs/)).not.toBeInTheDocument();
  });

  it('prefers item title and icon overrides over tool defaults', () => {
    render(
      <StackShareCard
        user={user}
        items={[
          buildItem({
            title: 'TS (strict mode)',
            icon: 'https://daily.dev/custom.png',
          }),
        ]}
      />,
    );

    expect(screen.getByText('TS (strict mode)')).toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
