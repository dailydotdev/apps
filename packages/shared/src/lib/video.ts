const videoMimeTypes: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  ogv: 'video/ogg',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
};

const getExtension = (url: string): string => {
  // Drop query/hash before reading the extension so cloudinary transform
  // params (e.g. `?_a=...`) don't hide it.
  const path = url.split(/[?#]/, 1)[0];
  const lastDot = path.lastIndexOf('.');
  return lastDot === -1 ? '' : path.slice(lastDot + 1).toLowerCase();
};

/**
 * Detects whether a markdown media URL points to a video file, so `![](url)`
 * can render as a `<video>` instead of an `<img>`.
 */
export const isVideoUrl = (url: string): boolean =>
  !!url && getExtension(url) in videoMimeTypes;

export const getVideoMimeType = (url: string): string | undefined =>
  videoMimeTypes[getExtension(url)];
