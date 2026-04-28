import {
  getSwipeOnboardingBarProgress,
  getSwipeOnboardingGuidanceMessage,
  getSwipeOnboardingHeadline,
} from './swipeOnboardingGuidance';

describe('getSwipeOnboardingGuidanceMessage', () => {
  it('returns fixed copy for 0 to 4 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(0)).toBe('Start swiping');
    expect(getSwipeOnboardingGuidanceMessage(1)).toBe('Keep swiping!');
    expect(getSwipeOnboardingGuidanceMessage(4)).toBe('Keep swiping!');
  });

  it('returns countdown copy from 5 to 9 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(5)).toBe('Swipe 5 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(9)).toBe('Swipe 1 more post.');
  });

  it('returns improve tier with remaining until 20 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(10)).toBe('Swipe 10 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(15)).toBe('Swipe 5 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(19)).toBe('Swipe 1 more post.');
  });

  it('returns fine-tune copy for 20 or more (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(20)).toBe('Swipe for fine-tune.');
    expect(getSwipeOnboardingGuidanceMessage(100)).toBe('Swipe for fine-tune.');
  });

  it('returns tag variant with remaining counts per tier', () => {
    expect(getSwipeOnboardingGuidanceMessage(0, 'tags')).toBe(
      'Pick 5 tags to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(3, 'tags')).toBe(
      'Pick 2 more tags to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(5, 'tags')).toBe(
      'Pick 5 more tags.',
    );
    expect(getSwipeOnboardingGuidanceMessage(10, 'tags')).toBe(
      'Pick 10 more tags.',
    );
    expect(getSwipeOnboardingGuidanceMessage(19, 'tags')).toBe(
      'Pick 1 more tag.',
    );
    expect(getSwipeOnboardingGuidanceMessage(20, 'tags')).toBe(
      'Add tags for fine-tune.',
    );
  });
});

describe('getSwipeOnboardingHeadline', () => {
  it('returns fixed starter headline for 0–4 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(0)).toEqual({
      line1: 'Swipe on at least 5 posts to tune your feed.',
    });
    expect(getSwipeOnboardingHeadline(4)).toEqual({
      line1: 'Swipe on at least 5 posts to tune your feed.',
    });
  });

  it('returns fixed improve-tier headline for 5–9 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(5)).toEqual({
      line1: 'Keep going, 5 more and it gets better.',
    });
    expect(getSwipeOnboardingHeadline(9)).toEqual({
      line1: 'Keep going, 5 more and it gets better.',
    });
  });

  it('returns fixed refine-tier headline for 10–19 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(10)).toEqual({
      line1: "You're getting there, 10 more to dial it in.",
    });
    expect(getSwipeOnboardingHeadline(19)).toEqual({
      line1: "You're getting there, 10 more to dial it in.",
    });
  });

  it('returns completion headline at 20 and above (swipe)', () => {
    expect(getSwipeOnboardingHeadline(20)).toEqual({
      line1: "You're all set! Keep swiping to fine-tune.",
    });
  });

  it('uses fixed tag wording per tier when variant is tags', () => {
    expect(getSwipeOnboardingHeadline(0, 'tags')).toEqual({
      line1: 'Tune your feed.',
      line2: 'Pick at least 5 tags to get started.',
    });
    expect(getSwipeOnboardingHeadline(4, 'tags')).toEqual({
      line1: 'Tune your feed.',
      line2: 'Pick at least 5 tags to get started.',
    });
    expect(getSwipeOnboardingHeadline(7, 'tags')).toEqual({
      line1: 'Keep going, 5 more and it gets better.',
    });
    expect(getSwipeOnboardingHeadline(12, 'tags')).toEqual({
      line1: "You're getting there, 10 more to dial it in.",
    });
    expect(getSwipeOnboardingHeadline(20, 'tags')).toEqual({
      line1: "You're all set! Keep adding tags to fine-tune.",
    });
  });
});

describe('getSwipeOnboardingBarProgress', () => {
  it('fills 0 to 100% linearly for swipes 0 to 4 (first phase)', () => {
    expect(getSwipeOnboardingBarProgress(0)).toBe(0);
    expect(getSwipeOnboardingBarProgress(2)).toBe(40);
    expect(getSwipeOnboardingBarProgress(4)).toBe(80);
  });

  it('shows 25% at swipe 5 (start of first quarter) then advances each 25% segment through 20', () => {
    expect(getSwipeOnboardingBarProgress(5)).toBe(25);
    expect(getSwipeOnboardingBarProgress(9)).toBe(45);
    expect(getSwipeOnboardingBarProgress(10)).toBe(50);
    expect(getSwipeOnboardingBarProgress(15)).toBe(75);
    expect(getSwipeOnboardingBarProgress(19)).toBe(95);
    expect(getSwipeOnboardingBarProgress(20)).toBe(100);
    expect(getSwipeOnboardingBarProgress(99)).toBe(100);
  });

  it('clamps negative swipe counts to 0', () => {
    expect(getSwipeOnboardingBarProgress(-1)).toBe(0);
  });
});
