import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PatchyOffer } from './PatchyOffer';
import type { PatchyOffer as Offer } from './usePatchyAssistant';
import { PATCHY_OFFER_TIMEOUT_MS } from './usePatchyAssistant';

const offer: Offer = {
  id: 1,
  kind: 'finished',
  text: 'Done! Worth an upvote?',
  primary: 'Upvote',
  secondary: 'Nah',
  isOverModal: true,
  onPrimary: jest.fn(),
};

const renderOffer = () => {
  const onAnswer = jest.fn();
  const onQuiet = jest.fn();
  render(
    <nav>
      <button type="button" id="streak-tab">
        Streak
      </button>
    </nav>,
  );
  render(
    <PatchyOffer
      offer={offer}
      anchorId="streak-tab"
      onAnswer={onAnswer}
      onQuiet={onQuiet}
    />,
  );
  return { onAnswer, onQuiet };
};

describe('PatchyOffer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('answers with the button you pick once he has slid away', () => {
    const { onAnswer } = renderOffer();
    expect(screen.getByText('Done! Worth an upvote?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Upvote' }));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onAnswer).toHaveBeenCalledWith('accept', 'primary');
  });

  it('counts the second button as "not now"', () => {
    const { onAnswer } = renderOffer();
    fireEvent.click(screen.getByRole('button', { name: 'Nah' }));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onAnswer).toHaveBeenCalledWith('dismiss', 'secondary');
  });

  it('offers never and quiet mode from its menu', () => {
    const { onAnswer, onQuiet } = renderOffer();
    fireEvent.click(screen.getByRole('button', { name: 'Suggestion options' }));
    fireEvent.click(screen.getByRole('button', { name: /Quiet mode/ }));
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onQuiet).toHaveBeenCalled();
    expect(onAnswer).toHaveBeenCalledWith('ignore', undefined);
  });

  it('leaves on its own, but not while you hover it', () => {
    const { onAnswer } = renderOffer();
    fireEvent.mouseEnter(
      screen.getByRole('dialog', { name: 'Patchy suggests' }),
    );
    act(() => {
      jest.advanceTimersByTime(PATCHY_OFFER_TIMEOUT_MS + 1000);
    });
    expect(onAnswer).not.toHaveBeenCalled();
    fireEvent.mouseLeave(
      screen.getByRole('dialog', { name: 'Patchy suggests' }),
    );
    act(() => {
      jest.advanceTimersByTime(PATCHY_OFFER_TIMEOUT_MS + 1000);
    });
    // Then he slides away before answering.
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onAnswer).toHaveBeenCalledWith('ignore', undefined);
  });
});
