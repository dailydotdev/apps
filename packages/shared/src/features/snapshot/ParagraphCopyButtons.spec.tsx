import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ParagraphCopyButtons } from './ParagraphCopyButtons';

const LONG =
  'A collection body runs to several paragraphs, and each one of them is a claim somebody might want to lift out on its own.';

const Harness = ({ html }: { html: string }): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Stands in for Markdown, which writes sanitized HTML into the DOM. */}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
      <ParagraphCopyButtons containerRef={containerRef} />
    </div>
  );
};

const renderBody = (html: string) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <Harness html={html} />
    </TestBootProvider>,
  );

describe('ParagraphCopyButtons', () => {
  it('ends every paragraph of the body with a copy control', async () => {
    renderBody(`<p>${LONG}</p><p>${LONG} And a second one.</p>`);

    await waitFor(() =>
      expect(screen.getAllByLabelText('Copy paragraph')).toHaveLength(2),
    );
  });

  it('puts the control inside the paragraph it copies', async () => {
    renderBody(`<p>${LONG}</p>`);

    const copy = await screen.findByLabelText('Copy paragraph');
    // Inside the <p>, so it trails the last line instead of sitting under it.
    expect(copy.closest('p')).not.toBeNull();
  });

  it('leaves a caption alone — copying one line helps nobody', async () => {
    renderBody('<p>Figure 1.</p>');

    await waitFor(() =>
      expect(screen.queryByLabelText('Copy paragraph')).not.toBeInTheDocument(),
    );
  });
});
