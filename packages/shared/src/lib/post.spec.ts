import { getUpvoteCountDisplay } from './post';

describe('getUpvoteCountDisplay', () => {
  const now = new Date('2026-03-30T12:00:00.000Z');

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows label for recent posts below threshold with zero upvotes', () => {
    const result = getUpvoteCountDisplay(
      0,
      3,
      'New',
      false,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: false, belowThresholdLabel: 'New' });
  });

  it('shows label for recent posts below threshold with positive upvotes', () => {
    const result = getUpvoteCountDisplay(
      2,
      3,
      'New',
      false,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: false, belowThresholdLabel: 'New' });
  });

  it('supports empty configured label', () => {
    const result = getUpvoteCountDisplay(
      2,
      3,
      '',
      false,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: false, belowThresholdLabel: '' });
  });

  it('hides label for old posts below threshold', () => {
    const result = getUpvoteCountDisplay(
      2,
      3,
      'New',
      false,
      '2026-03-28T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: false, belowThresholdLabel: '' });
  });

  it('shows numeric count at or above threshold', () => {
    const result = getUpvoteCountDisplay(
      3,
      3,
      'New',
      false,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: true, belowThresholdLabel: '' });
  });

  it('shows numeric count when user already upvoted', () => {
    const result = getUpvoteCountDisplay(
      0,
      3,
      'New',
      true,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: true, belowThresholdLabel: '' });
  });

  it('keeps control behavior when threshold is disabled', () => {
    const result = getUpvoteCountDisplay(
      1,
      0,
      'New',
      false,
      '2026-03-30T11:00:00.000Z',
      24,
    );

    expect(result).toEqual({ showCount: true, belowThresholdLabel: '' });
  });
});
