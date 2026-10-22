import { feedWidgetTips, getFeedWidgetTips, pickFeedWidgetTip } from './tips';

describe('feed widget tips', () => {
  it('picks every tip from the set, whatever the draw', () => {
    const tips = getFeedWidgetTips();

    expect(pickFeedWidgetTip(() => 0)).toBe(tips[0]);
    expect(pickFeedWidgetTip(() => 0.999999)).toBe(tips[tips.length - 1]);
    expect(feedWidgetTips).toContain(pickFeedWidgetTip());
  });

  it('gives every tip its own id', () => {
    const ids = feedWidgetTips.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
