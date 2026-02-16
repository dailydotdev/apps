import { isPlaceholderImage } from './image';

describe('isPlaceholderImage', () => {
  it('returns true for API placeholder images', () => {
    expect(
      isPlaceholderImage(
        'https://media.daily.dev/image/upload/f_auto/v1/placeholders/3',
      ),
    ).toBe(true);
  });

  it('returns true for frontend fallback placeholder image', () => {
    expect(
      isPlaceholderImage(
        'https://media.daily.dev/image/upload/s--P4t4XyoV--/f_auto/v1722860399/public/Placeholder%2001',
      ),
    ).toBe(true);
  });

  it('returns false for non-placeholder images', () => {
    expect(
      isPlaceholderImage(
        'https://media.daily.dev/image/upload/f_auto/v1/public/real-image',
      ),
    ).toBe(false);
  });

  it('returns false for other domains and invalid urls', () => {
    expect(
      isPlaceholderImage(
        'https://example.com/image/upload/f_auto/placeholders/3',
      ),
    ).toBe(false);
    expect(isPlaceholderImage('not-a-url')).toBe(false);
  });
});
