import React from 'react';
import { render, screen } from '@testing-library/react';
import type { SourceStack } from '../../../graphql/source/sourceStack';
import { webappUrl } from '../../../lib/constants';
import { SourceStackItem } from './SourceStackItem';

jest.mock('../../utilities/Link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const buildItem = (overrides?: Partial<SourceStack>): SourceStack => ({
  id: 'source-stack-1',
  tool: {
    id: 'tool-1',
    title: 'TypeScript',
    slug: 'typescript',
    faviconUrl: null,
  },
  position: 0,
  icon: null,
  title: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: {
    id: 'user-1',
    name: 'Lee',
    image: 'https://daily.dev/lee.png',
  },
  ...overrides,
});

describe('SourceStackItem', () => {
  it('links stack tools to their tool page', () => {
    render(<SourceStackItem item={buildItem()} canEdit={false} />);

    expect(screen.getByRole('link', { name: 'TypeScript' })).toHaveAttribute(
      'href',
      `${webappUrl}tools/typescript`,
    );
  });

  it('uses the tool slug when the stack item has a custom title', () => {
    render(
      <SourceStackItem
        item={buildItem({ title: 'TypeScript strict mode' })}
        canEdit={false}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'TypeScript strict mode' }),
    ).toHaveAttribute('href', `${webappUrl}tools/typescript`);
  });

  it('renders without a link when no tool slug is available', () => {
    render(
      <SourceStackItem
        item={buildItem({
          tool: {
            id: 'tool-1',
            title: 'TypeScript',
            slug: '',
            faviconUrl: null,
          },
        })}
        canEdit={false}
      />,
    );

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
