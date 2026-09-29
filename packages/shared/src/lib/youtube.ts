export const MAX_YOUTUBE_EMBEDS = 3;

const youtubeVideoIdRegex = /^[\w-]{11}$/;
const youtubePathPrefixes = ['embed', 'shorts', 'live', 'v'];
const youtubeHosts = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
];
const anchorHrefRegex = /<a\s[^>]*?href="([^"]*)"/gi;

const toVideoId = (value?: string | null): string | undefined =>
  value && youtubeVideoIdRegex.test(value) ? value : undefined;

export const getYoutubeVideoId = (link: string): string | undefined => {
  let url: URL;

  try {
    url = new URL(link);
  } catch {
    return undefined;
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return undefined;
  }

  const [first, second] = url.pathname.split('/').filter(Boolean);

  if (url.hostname === 'youtu.be') {
    return toVideoId(first);
  }

  if (!youtubeHosts.includes(url.hostname)) {
    return undefined;
  }

  if (first === 'watch') {
    return toVideoId(url.searchParams.get('v'));
  }

  return youtubePathPrefixes.includes(first) ? toVideoId(second) : undefined;
};

export const getYoutubeVideoIdsFromHtml = (html?: string | null): string[] => {
  if (!html) {
    return [];
  }

  const videoIds = Array.from(html.matchAll(anchorHrefRegex), ([, href]) =>
    getYoutubeVideoId(href.replace(/&amp;/g, '&')),
  ).filter((videoId): videoId is string => !!videoId);

  return [...new Set(videoIds)].slice(0, MAX_YOUTUBE_EMBEDS);
};
