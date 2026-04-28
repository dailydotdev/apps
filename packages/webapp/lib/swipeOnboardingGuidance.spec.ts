import {
  getSwipeOnboardingBarProgress,
  getSwipeOnboardingGuidanceMessage,
  getSwipeOnboardingHeadline,
} from './swipeOnboardingGuidance';

describe('getSwipeOnboardingGuidanceMessage', () => {
  it('returns starter tier with remaining count for 0 to 9 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(0)).toBe(
      'Swipe 10 posts to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(1)).toBe(
      'Swipe 9 more posts to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(9)).toBe(
      'Swipe 1 more post to get started.',
    );
  });

  it('returns improve tier with remaining until 20 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(10)).toBe('Swipe 10 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(15)).toBe('Swipe 5 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(19)).toBe('Swipe 1 more post.');
  });

  it('returns refine tier with remaining until 40 (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(20)).toBe('Swipe 20 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(30)).toBe('Swipe 10 more posts.');
    expect(getSwipeOnboardingGuidanceMessage(39)).toBe('Swipe 1 more post.');
  });

  it('returns fine-tune copy for 40 or more (swipe)', () => {
    expect(getSwipeOnboardingGuidanceMessage(40)).toBe('Swipe for fine-tune.');
    expect(getSwipeOnboardingGuidanceMessage(100)).toBe('Swipe for fine-tune.');
  });

  it('returns tag variant with remaining counts per tier', () => {
    expect(getSwipeOnboardingGuidanceMessage(0, 'tags')).toBe(
      'Pick 10 tags to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(3, 'tags')).toBe(
      'Pick 7 more tags to get started.',
    );
    expect(getSwipeOnboardingGuidanceMessage(10, 'tags')).toBe(
      'Pick 10 more tags.',
    );
    expect(getSwipeOnboardingGuidanceMessage(19, 'tags')).toBe(
      'Pick 1 more tag.',
    );
    expect(getSwipeOnboardingGuidanceMessage(25, 'tags')).toBe(
      'Pick 15 more tags.',
    );
    expect(getSwipeOnboardingGuidanceMessage(40, 'tags')).toBe(
      'Add tags for fine-tune.',
    );
  });
});

describe('getSwipeOnboardingHeadline', () => {
  it('returns fixed two-line starter for 0–9 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(0)).toEqual({
      line1: 'Tune your feed.',
      line2: 'Swipe on at least 10 posts to get started.',
    });
    expect(getSwipeOnboardingHeadline(5)).toEqual({
      line1: 'Tune your feed.',
      line2: 'Swipe on at least 10 posts to get started.',
    });
    expect(getSwipeOnboardingHeadline(9)).toEqual({
      line1: 'Tune your feed.',
      line2: 'Swipe on at least 10 posts to get started.',
    });
  });

  it('returns fixed improve-tier headline for 10–19 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(10)).toEqual({
      line1: 'Keep going, 10 more and it gets better.',
    });
    expect(getSwipeOnboardingHeadline(15)).toEqual({
      line1: 'Keep going, 10 more and it gets better.',
    });
    expect(getSwipeOnboardingHeadline(19)).toEqual({
      line1: 'Keep going, 10 more and it gets better.',
    });
  });

  it('returns fixed refine-tier headline for 20–39 (swipe)', () => {
    expect(getSwipeOnboardingHeadline(20)).toEqual({
      line1: "You're getting there, 20 more to dial it in.",
    });
    expect(getSwipeOnboardingHeadline(30)).toEqual({
      line1: "You're getting there, 20 more to dial it in.",
    });
    expect(getSwipeOnboardingHeadline(39)).toEqual({
      line1: "You're getting there, 20 more to dial it in.",
    });
  });

  it('returns completion headline at 40 and above (swipe)', () => {
    expect(getSwipeOnboardingHeadline(40)).toEqual({
      line1: "You're all set! Keep swiping to fine-tune.",
    });
  });

  it('uses fixed tag wording per tier when variant is tags', () => {
    expect(getSwipeOnboardingHeadline(0, 'tags')).toEqual({
      line1: 'Tune your feed.',
      line2: 'Pick at least 10 tags to get started.',
    });
    expect(getSwipeOnboardingHeadline(7, 'tags')).toEqual({
      line1: 'Tune your feed.',
      line2: 'Pick at least 10 tags to get started.',
    });
    expect(getSwipeOnboardingHeadline(12, 'tags')).toEqual({
      line1: 'Keep going, 10 more and it gets better.',
    });
    expect(getSwipeOnboardingHeadline(35, 'tags')).toEqual({
      line1: "You're getting there, 20 more to dial it in.",
    });
    expect(getSwipeOnboardingHeadline(40, 'tags')).toEqual({
      line1: "You're all set! Keep adding tags to fine-tune.",
    });
  });
});

describe('getSwipeOnboardingBarProgress', () => {
  it('fills 0 to 100% for swipes 0 to 9, then shows 25% at swipe 10 (first quarter)', () => {
    expect(getSwipeOnboardingBarProgress(0)).toBe(0);
    expect(getSwipeOnboardingBarProgress(5)).toBe(50);
    expect(getSwipeOnboardingBarProgress(9)).toBe(90);
    expect(getSwipeOnboardingBarProgress(10)).toBe(25);
  });

  it('advances each 25% segment over the next 10 swipes through 40', () => {
    expect(getSwipeOnboardingBarProgress(15)).toBe(37.5);
    expect(getSwipeOnboardingBarProgress(19)).toBe(47.5);
    expect(getSwipeOnboardingBarProgress(20)).toBe(50);
    expect(getSwipeOnboardingBarProgress(30)).toBe(75);
    expect(getSwipeOnboardingBarProgress(39)).toBe(97.5);
    expect(getSwipeOnboardingBarProgress(40)).toBe(100);
    expect(getSwipeOnboardingBarProgress(99)).toBe(100);
  });

  it('clamps negative swipe counts to 0', () => {
    expect(getSwipeOnboardingBarProgress(-1)).toBe(0);
  });
});
