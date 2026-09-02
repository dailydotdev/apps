import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BriefBodyShareControls } from './BriefBodyShareControls';
import type { Post } from '../../../graphql/posts';

let mockIsEnabled = false;

jest.mock('../../snapshot/useSharePlacement', () => ({
  useSharePlacement: () => mockIsEnabled,
}));

const BODY = `
  <h2>Must know</h2>
  <ul>
    <li><strong>Agents are eating dev tools</strong>: The shift is accelerating.</li>
    <li><strong>Postgres keeps eating specialists</strong>: One engine, every workload.</li>
  </ul>
  <h2>Worth a look</h2>
  <p>A paragraph under the second heading.</p>
`;

const post = {
  id: 'brief-1',
  title: "Tomer's presidential briefing",
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

const Harness = () => {
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div ref={bodyRef} dangerouslySetInnerHTML={{ __html: BODY }} />
      <BriefBodyShareControls
        bodyRef={bodyRef}
        contentHtml={BODY}
        post={post}
      />
    </>
  );
};

const renderComponent = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Harness />
    </QueryClientProvider>,
  );

describe('BriefBodyShareControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnabled = false;
  });

  it('adds nothing to the body while the placement is off', () => {
    renderComponent();

    expect(screen.queryAllByRole('button', { name: /^Copy:/ })).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'Snapshot' }),
    ).not.toBeInTheDocument();
  });

  it('puts a copy button inside every bullet and paragraph', () => {
    mockIsEnabled = true;
    renderComponent();

    const buttons = screen.getAllByRole('button', { name: /^Copy:/ });

    expect(buttons).toHaveLength(3);
    // Inside the block, not trailing the body: the icon runs in at the end of
    // the text it copies.
    buttons.forEach((button) =>
      expect(button.closest('li, p')).toBeInTheDocument(),
    );
    // One label per block, so the buttons are told apart out of context.
    expect(
      new Set(buttons.map((button) => button.getAttribute('aria-label'))).size,
    ).toBe(3);
  });

  it('puts one snapshot button on the Must know heading', () => {
    mockIsEnabled = true;
    renderComponent();

    const snapshots = screen.getAllByRole('button', { name: 'Snapshot' });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].closest('h2')).toHaveTextContent('Must know');
  });

  it('captures the Must know bullets, and only those', () => {
    mockIsEnabled = true;
    renderComponent();

    // Twice over: once in the body the reader sees, once in the off-screen
    // card the capture reads from.
    expect(screen.getAllByText('Agents are eating dev tools')).toHaveLength(2);
    expect(
      screen.getAllByText('Postgres keeps eating specialists'),
    ).toHaveLength(2);
    // The other section stays out of the card.
    expect(
      screen.getAllByText('A paragraph under the second heading.'),
    ).toHaveLength(1);
  });
});
