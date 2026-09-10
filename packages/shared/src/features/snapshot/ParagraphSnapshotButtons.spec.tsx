import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { ParagraphSnapshotButtons } from './ParagraphSnapshotButtons';

const LONG =
  'A collection body runs to several paragraphs, and each one of them is a claim somebody might want to lift out on its own.';

const Harness = ({ html }: { html: string }): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Stands in for Markdown, which writes sanitized HTML into the DOM. */}
      <div
        data-testid="paragraph-body"
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <ParagraphSnapshotButtons containerRef={containerRef} post={post} />
    </div>
  );
};

const renderBody = (html: string) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <Harness html={html} />
    </TestBootProvider>,
  );

describe('ParagraphSnapshotButtons', () => {
  it('ends every paragraph of the body with a snapshot control', async () => {
    renderBody(`<p>${LONG}</p><p>${LONG} And a second one.</p>`);

    await waitFor(() =>
      expect(screen.getAllByLabelText('Snapshot')).toHaveLength(2),
    );
  });

  it('puts the control inside the paragraph it captures', async () => {
    renderBody(`<p>${LONG}</p>`);

    const snapshot = await screen.findByLabelText('Snapshot');
    // Inside the <p>, so it trails the last line instead of sitting under it.
    expect(snapshot.closest('p')).not.toBeNull();
  });

  it('leaves a caption alone — one line is not worth a card', async () => {
    renderBody('<p>Figure 1.</p>');

    await waitFor(() =>
      expect(screen.queryByLabelText('Snapshot')).not.toBeInTheDocument(),
    );
  });

  it('keeps each paragraph out of the page until it is reached for', async () => {
    renderBody(`<p>${LONG}</p>`);

    await screen.findByLabelText('Snapshot');
    // The card repeats the paragraph, and a long body has many of them.
    expect(screen.queryAllByText(LONG, { exact: true })).toHaveLength(1);
  });

  it('captures one paragraph, not the body around it', async () => {
    const second = `${LONG} And a second one entirely.`;
    renderBody(`<p>${LONG}</p><p>${second}</p>`);

    await waitFor(() =>
      expect(screen.getAllByLabelText('Snapshot')).toHaveLength(2),
    );
    const [first] = screen.getAllByLabelText('Snapshot');
    fireEvent.pointerEnter(first);

    // The card sits on the body, not inside the paragraph: left in the prose
    // it would be a div inside a p, and the observer would read its copy back
    // as part of the paragraph and grow what the button captures.
    const card = document.body.querySelector('[aria-hidden] [class*="fixed"]');
    expect(card).toBeNull();
    expect(
      screen.getByTestId('paragraph-body').querySelector('div'),
    ).toBeNull();
    // Exactly one card, holding this paragraph alone.
    expect(screen.getAllByText(LONG, { exact: true })).toHaveLength(2);
    expect(screen.getAllByText(second, { exact: true })).toHaveLength(1);
  });
});
