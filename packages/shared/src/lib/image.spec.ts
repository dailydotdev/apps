import { isImageUrl, isPlaceholderImage } from './image';

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

  it('returns true for capitalized Placeholder in URL', () => {
    expect(
      isPlaceholderImage(
        'https://media.daily.dev/image/upload/f_auto/v1/public/Placeholder-image',
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

describe('isImageUrl', () => {
  it('matches image file extensions with query strings and fragments', () => {
    expect(isImageUrl('https://example.com/screenshot.PNG?width=800#top')).toBe(
      true,
    );
    expect(isImageUrl('https://example.com/photo.avif')).toBe(true);
    expect(isImageUrl('https://example.com/icon.svg')).toBe(true);
  });

  it('matches daily media and Cloudinary image URLs without extensions', () => {
    expect(
      isImageUrl('https://media.daily.dev/image/upload/f_auto/v1/posts/abc'),
    ).toBe(true);
    expect(
      isImageUrl('https://res.cloudinary.com/daily-now/image/upload/abc'),
    ).toBe(true);
    expect(
      isImageUrl('https://daily-now-res.cloudinary.com/image/upload/abc'),
    ).toBe(true);
  });

  it('matches protocol-relative and relative image URLs', () => {
    expect(isImageUrl('//cdn.example.com/image.webp')).toBe(true);
    expect(isImageUrl('/uploads/image.jpg?raw=1')).toBe(true);
    expect(isImageUrl('../assets/image.gif')).toBe(true);
  });

  it('rejects non-image URLs', () => {
    expect(isImageUrl('https://example.com/articles/123')).toBe(false);
    expect(
      isImageUrl('https://res.cloudinary.com/daily-now/raw/upload/abc'),
    ).toBe(false);
  });
});
