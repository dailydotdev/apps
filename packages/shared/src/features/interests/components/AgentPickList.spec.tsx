import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import basePost from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { narrowContainerWidth } from '../hooks/useNarrowContainer';
import { AgentProvider } from '../AgentContext';
import { AgentPickList } from './AgentPickList';

type Observed = (entries: { contentRect: { width: number } }[]) => void;

let notify: Observed;

beforeEach(() => {
  jest
    .spyOn(globalThis, 'ResizeObserver')
    .mockImplementation((callback: ResizeObserverCallback) => {
      notify = callback as unknown as Observed;

      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
});

afterEach(() => jest.restoreAllMocks());

const post = {
  ...basePost,
  id: 'p1',
  title: 'Zig 0.15',
} as Post;

const renderList = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[]}>
        <AgentPickList posts={[post]} onOpen={jest.fn()} />
      </AgentProvider>
    </TestBootProvider>,
  );

const measure = (width: number) =>
  act(() => notify([{ contentRect: { width } }]));

const row = () =>
  screen.getByRole('heading', { name: 'Zig 0.15' }).parentElement;

describe('a pick row in a narrow column', () => {
  it('sits side by side while the column has room', () => {
    renderList();

    measure(narrowContainerWidth);

    expect(row()).toHaveClass('tablet:flex-row');
  });

  it('drops its stats below the title, the way a phone does', () => {
    renderList();

    measure(narrowContainerWidth - 1);

    expect(row()).not.toHaveClass('tablet:flex-row');
    expect(row()).toHaveClass('flex-col');
  });

  it('keeps the source logo out of the stacked row, the way a phone does', () => {
    renderList();

    measure(narrowContainerWidth - 1);

    const logo = screen.getByAltText(post.source?.name ?? '').parentElement
      ?.parentElement;

    expect(logo).toHaveClass('hidden');
    expect(logo).not.toHaveClass('tablet:inline-flex');
  });

  it('comes back apart when the column widens again', () => {
    renderList();

    measure(narrowContainerWidth - 1);
    measure(narrowContainerWidth + 200);

    expect(row()).toHaveClass('tablet:flex-row');
  });
});
