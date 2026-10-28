import type { FeedWidget } from './types';
import { customFeedWidgets, feedRailFingerprint } from './storedRail';

const written = [
  {
    id: 'digest',
    kind: 'topicalDigest',
    size: 'tall',
    config: { tags: ['react', 'rust'], period: { days: 7, from: 'now' } },
  },
] as unknown as FeedWidget[];

// As jsonb hands them back: the same widgets, keys in another order.
const readBack = [
  {
    size: 'tall',
    kind: 'topicalDigest',
    config: { period: { from: 'now', days: 7 }, tags: ['react', 'rust'] },
    id: 'digest',
  },
] as unknown as FeedWidget[];

describe('feedRailFingerprint', () => {
  it('reads the same however the settings order the keys', () => {
    expect(feedRailFingerprint(readBack)).toBe(feedRailFingerprint(written));
    expect(
      customFeedWidgets({
        version: 1,
        widgets: readBack,
        fromDefault: feedRailFingerprint(written),
      }),
    ).toBeNull();
  });

  it('tells apart an edit, down to the order of a list', () => {
    const [widget] = written;

    expect(
      feedRailFingerprint([
        { ...widget, config: { ...widget.config, tags: ['rust', 'react'] } },
      ] as unknown as FeedWidget[]),
    ).not.toBe(feedRailFingerprint(written));
  });

  // Stored on every rail saved over the default: a change here flips those
  // readers to customized, so it needs a migration, not a new expectation.
  it('keeps its stored format', () => {
    expect(
      feedRailFingerprint([
        { id: 'top-story', kind: 'topStory', size: 'large' },
      ] as unknown as FeedWidget[]),
    ).toBe('[["top-story","topStory","large",null,null]]');
    expect(feedRailFingerprint(written)).toBe(
      '[["digest","topicalDigest","tall",{"period":{"days":7,"from":"now"},"tags":["react","rust"]},null]]',
    );
  });
});
