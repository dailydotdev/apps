import {
  emojiCategories,
  getRecentEmojis,
  saveRecentEmoji,
  searchEmojis,
} from './emojis';

describe('emojis', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('groups emojis by native picker categories', () => {
    expect(emojiCategories.map((category) => category.id)).toEqual([
      'smileys-emotion',
      'people-body',
      'animals-nature',
      'food-drink',
      'travel-places',
      'activities',
      'objects',
      'symbols',
      'flags',
    ]);
    expect(
      emojiCategories.every((category) => category.emojis.length > 0),
    ).toBe(true);
  });

  it('searches by labels and tags', () => {
    expect(searchEmojis('rocket').map((item) => item.emoji)).toContain('🚀');
    expect(searchEmojis('space').map((item) => item.emoji)).toContain('🚀');
  });

  it('persists recently used emojis in most-recent order', () => {
    saveRecentEmoji('🚀');
    saveRecentEmoji('🔥');
    saveRecentEmoji('🚀');

    expect(getRecentEmojis().slice(0, 2)).toEqual(['🚀', '🔥']);
  });
});
