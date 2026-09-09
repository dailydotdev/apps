import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { SelectionSnapshotBar } from './SelectionSnapshotBar';

const QUOTE =
  'They optimised the product they had instead of the one their customers were moving to.';

beforeAll(() => {
  // jsdom has no layout, and the bar refuses a selection it cannot place.
  Range.prototype.getBoundingClientRect = () =>
    ({ top: 400, bottom: 440, left: 100, width: 300 } as DOMRect);
});

const Harness = (): ReactElement => {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <main ref={containerRef}>
      <SelectionSnapshotBar containerRef={containerRef} post={post} />
      <p data-testid="body">{QUOTE}</p>
      <p data-testid="outside-body">Comments live out here.</p>
    </main>
  );
};

const renderBar = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <Harness />
    </TestBootProvider>,
  );

const select = (testId: string, length?: number) => {
  const node = screen.getByTestId(testId).firstChild as Node;
  const range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, length ?? node.textContent?.length ?? 0);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  // The reader letting go of the drag is what commits the quote.
  fireEvent.pointerUp(document);
};

const toolbar = () =>
  screen.queryByRole('toolbar', { name: 'Share selected text' });

describe('SelectionSnapshotBar', () => {
  it('offers a snapshot of a quote selected in the post body', () => {
    renderBar();

    select('body');

    expect(toolbar()).toBeInTheDocument();
    expect(screen.getByLabelText('Snapshot')).toBeInTheDocument();
  });

  it('ignores a selection too short to be a quote', () => {
    renderBar();

    select('body', 6);

    expect(toolbar()).not.toBeInTheDocument();
  });

  it('leaves selections outside the post body alone', () => {
    renderBar();

    const outside = document.createElement('p');
    outside.textContent = QUOTE;
    document.body.appendChild(outside);

    const range = document.createRange();
    range.selectNodeContents(outside);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));

    expect(toolbar()).not.toBeInTheDocument();
  });
});

describe('SelectionSnapshotBar placement', () => {
  const rectAt = (rect: Partial<DOMRect>) => {
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 400, bottom: 440, left: 100, width: 300, ...rect } as DOMRect);
  };

  const barStyle = () =>
    screen.getByRole('toolbar', { name: 'Share selected text' }).style;

  afterAll(() => rectAt({}));

  it('keeps the bar on screen when the quote sits at the bottom edge', () => {
    // The post modal is a short scroll area, so a quote can end at the very
    // bottom of the viewport. Flipping below it would put the bar off screen.
    Object.assign(globalThis, { innerHeight: 800, innerWidth: 1440 });
    rectAt({ top: 4, bottom: 790 });

    renderBar();
    select('body');

    const top = parseFloat(barStyle().top);
    expect(top).toBeGreaterThanOrEqual(8);
    expect(top).toBeLessThanOrEqual(800 - 44 - 8);
  });

  it('keeps the bar clear of the side edges', () => {
    Object.assign(globalThis, { innerHeight: 800, innerWidth: 1440 });
    rectAt({ left: 1430, width: 10 });

    renderBar();
    select('body');

    const left = parseFloat(barStyle().left);
    expect(left).toBeLessThanOrEqual(1440 - 96);
    expect(left).toBeGreaterThanOrEqual(96);
  });
});
