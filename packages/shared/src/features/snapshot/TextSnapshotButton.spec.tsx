import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import { Origin } from '../../lib/log';
import { TextSnapshotButton } from './TextSnapshotButton';

const SUMMARY =
  'Every one of them optimised the product they had instead of the one their customers were moving to.';

const renderButton = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <TextSnapshotButton
        filename="daily-summary"
        origin={Origin.PostSummary}
        post={post}
        text={SUMMARY}
      />
    </TestBootProvider>,
  );

const cardCopies = () => screen.queryAllByText(SUMMARY).length;

describe('TextSnapshotButton', () => {
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
