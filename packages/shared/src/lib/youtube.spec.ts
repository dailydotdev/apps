import {
  getYoutubeVideoId,
  getYoutubeVideoIdsFromHtml,
  MAX_YOUTUBE_EMBEDS,
} from './youtube';

describe('getYoutubeVideoId', () => {
  it.each([
    'https://www.youtube.com/watch?v=igZCEr3HwCg',
    'https://youtube.com/watch?feature=share&v=igZCEr3HwCg&t=42',
    'https://m.youtube.com/watch?v=igZCEr3HwCg',
    'https://youtu.be/igZCEr3HwCg?si=abc',
    'https://www.youtube.com/shorts/igZCEr3HwCg',
    'https://www.youtube.com/live/igZCEr3HwCg',
    'https://www.youtube.com/embed/igZCEr3HwCg',
    'https://www.youtube-nocookie.com/embed/igZCEr3HwCg',
  ])('should read the video id from %s', (link) => {
    expect(getYoutubeVideoId(link)).toBe('igZCEr3HwCg');
  });

  it.each([
    'https://www.youtube.com/@dailydotdev',
    'https://www.youtube.com/playlist?list=PL123',
    'https://www.youtube.com/watch?v=short',
    'https://notyoutube.com/watch?v=igZCEr3HwCg',
    'https://youtube.com.evil.dev/watch?v=igZCEr3HwCg',
    'ftp://youtu.be/igZCEr3HwCg',
    'not a url',
  ])('should ignore %s', (link) => {
    expect(getYoutubeVideoId(link)).toBeUndefined();
  });
});

describe('getYoutubeVideoIdsFromHtml', () => {
  it('should read unique video ids from anchors in order', () => {
    const html = `<p>Watch <a href="https://www.youtube.com/watch?feature=share&amp;v=igZCEr3HwCg" target="_blank">this</a>
      and <a href="https://daily.dev">that</a>, then
      <a href="https://youtu.be/dQw4w9WgXcQ">https://youtu.be/dQw4w9WgXcQ</a>
      and again <a href="https://youtu.be/igZCEr3HwCg">it</a></p>`;

    expect(getYoutubeVideoIdsFromHtml(html)).toEqual([
      'igZCEr3HwCg',
      'dQw4w9WgXcQ',
    ]);
  });

  it('should ignore youtube links that are not anchors', () => {
    const html =
      '<p>https://youtu.be/igZCEr3HwCg</p><img src="https://youtu.be/dQw4w9WgXcQ">';

    expect(getYoutubeVideoIdsFromHtml(html)).toEqual([]);
  });

  it('should cap the number of embeds', () => {
    const html = Array.from(
      { length: MAX_YOUTUBE_EMBEDS + 2 },
      (_, index) => `<a href="https://youtu.be/video-id-0${index}">v</a>`,
    ).join('');

    expect(getYoutubeVideoIdsFromHtml(html)).toHaveLength(MAX_YOUTUBE_EMBEDS);
  });
});
