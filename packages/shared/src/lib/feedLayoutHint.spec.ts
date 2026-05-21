import { FeedItemType } from '../components/cards/common/common';
import {
  AD_MAX_LAYOUT_HINT,
  DEFAULT_LAYOUT_HINT,
  isLayoutHint,
  resolveLayoutHint,
} from './feedLayoutHint';

describe('isLayoutHint', () => {
  it.each(['1x1', '1x2', '2x1'])('recognizes valid hint %s', (hint) => {
    expect(isLayoutHint(hint)).toBe(true);
  });

  it.each([null, undefined, '', 'invalid', '4x4', '2x2', '3x2', 5])(
    'rejects invalid hint %s',
    (hint) => {
      expect(isLayoutHint(hint)).toBe(false);
    },
  );
});

describe('resolveLayoutHint', () => {
  it('returns default hint when feature is disabled', () => {
    expect(
      resolveLayoutHint({
        rawHint: '2x1',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: true,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);
  });

  it('returns default hint on mobile regardless of backend hint', () => {
    expect(
      resolveLayoutHint({
        rawHint: '1x2',
        itemType: FeedItemType.Post,
        isMobile: true,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);
  });

  it('returns default hint for unsupported item types', () => {
    expect(
      resolveLayoutHint({
        rawHint: '2x1',
        itemType: FeedItemType.MarketingCta,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);
  });

  it('allows 1x2 layout for highlight items', () => {
    expect(
      resolveLayoutHint({
        rawHint: '1x2',
        itemType: FeedItemType.Highlight,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe('1x2');
  });

  it('returns default hint when backend value is missing or invalid', () => {
    expect(
      resolveLayoutHint({
        rawHint: undefined,
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);

    expect(
      resolveLayoutHint({
        rawHint: '4x4',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);
  });

  it('treats unsupported larger hints (2x2, 3x2) as invalid', () => {
    expect(
      resolveLayoutHint({
        rawHint: '2x2',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);

    expect(
      resolveLayoutHint({
        rawHint: '3x2',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe(DEFAULT_LAYOUT_HINT);
  });

  it('preserves valid post hints', () => {
    expect(
      resolveLayoutHint({
        rawHint: '2x1',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe('2x1');

    expect(
      resolveLayoutHint({
        rawHint: '1x2',
        itemType: FeedItemType.Post,
        isMobile: false,
        isDisabled: false,
      }),
    ).toBe('1x2');
  });

  it('exposes the configured ad cap at 2x1', () => {
    expect(AD_MAX_LAYOUT_HINT).toBe('2x1');
  });
});
