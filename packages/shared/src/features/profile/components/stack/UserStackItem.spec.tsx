import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { UserStack } from '../../../../graphql/user/userStack';
import { UserStackItem } from './UserStackItem';

const createMockStackItem = (
  overrides: Partial<UserStack> = {},
): UserStack => ({
  id: 'stack-1',
  tool: {
    id: 'tool-1',
    title: 'React',
    faviconUrl: null,
  },
  section: 'Primary',
  position: 0,
  startedAt: null,
  icon: null,
  title: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const renderComponent = (
  item: UserStack,
  isOwner = false,
): RenderResult => {
  return render(<UserStackItem item={item} isOwner={isOwner} />);
};

describe('UserStackItem', () => {
  it('should display the tool title', () => {
    const item = createMockStackItem();
    renderComponent(item);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should display the custom title when provided', () => {
    const item = createMockStackItem({ title: 'Custom React Title' });
    renderComponent(item);
    expect(screen.getByText('Custom React Title')).toBeInTheDocument();
  });

  it('should display favicon image when faviconUrl is provided', () => {
    const item = createMockStackItem({
      tool: {
        id: 'tool-1',
        title: 'React',
        faviconUrl: 'https://example.com/react.png',
      },
    });
    renderComponent(item);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/react.png');
  });

  it('should display PlusIcon fallback when faviconUrl is not provided', () => {
    const item = createMockStackItem({
      tool: {
        id: 'tool-1',
        title: 'React',
        faviconUrl: null,
      },
    });
    renderComponent(item);
    // PlusIcon should be rendered as an SVG
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('size-6');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should display "Since" date when startedAt is provided', () => {
    const item = createMockStackItem({
      startedAt: '2020-06-15T00:00:00.000Z',
    });
    renderComponent(item);
    expect(screen.getByText(/Since/)).toBeInTheDocument();
  });

  it('should not display "Since" date when startedAt is not provided', () => {
    const item = createMockStackItem({ startedAt: null });
    renderComponent(item);
    expect(screen.queryByText(/Since/)).not.toBeInTheDocument();
  });

  it('should show edit and delete buttons when user is owner', () => {
    const item = createMockStackItem();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <UserStackItem
        item={item}
        isOwner={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByLabelText('Edit stack item')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete stack item')).toBeInTheDocument();
  });

  it('should not show edit and delete buttons when user is not owner', () => {
    const item = createMockStackItem();
    renderComponent(item, false);
    expect(screen.queryByLabelText('Edit stack item')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Delete stack item'),
    ).not.toBeInTheDocument();
  });
});
