export function isValidHttpUrl(link: string): boolean {
  let url: URL;

  try {
    url = new URL(link);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}
