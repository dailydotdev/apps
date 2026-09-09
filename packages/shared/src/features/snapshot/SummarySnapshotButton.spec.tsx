import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { SummarySnapshotButton } from './SummarySnapshotButton';

const SUMMARY =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const renderButton = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SummarySnapshotButton post={post} summary={SUMMARY} />
    </TestBootProvider>,
  );

const cardCopies = () => screen.queryAllByText(SUMMARY).length;

describe('SummarySnapshotButton', () => {
  it('keeps the card out of the page until the reader reaches for it', () => {
    renderButton();

    expect(screen.getByLabelText('Snapshot')).toBeInTheDocument();
    // The card repeats the whole summary, so mounting it with the page would
    // put a second copy of the post's own copy in every post's document.
    expect(cardCopies()).toBe(0);
  });

  it.each([
    ['hover', (el: HTMLElement) => fireEvent.pointerEnter(el)],
    ['touch', (el: HTMLElement) => fireEvent.pointerDown(el)],
    ['focus', (el: HTMLElement) => fireEvent.focus(el)],
  ])('mounts the card on %s, before the press lands', (_, act) => {
    renderButton();

    act(screen.getByLabelText('Snapshot'));

    expect(cardCopies()).toBe(1);
  });
});
