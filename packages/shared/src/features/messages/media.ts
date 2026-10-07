// Images ride in the body as markdown, the same way comments embed uploads
// and GIFs, so clients without media support still show a usable link.
const imageMarkdownRegex = /!\[([^\]\n]*)\]\((https:\/\/[^)\s]+)\)/g;

// Any client can put any URL in a message, and rendering it would hand the
// reader's IP to whoever hosts it. Only our CDN and the GIF providers render;
// everything else stays text. Mirrors the API's image proxy allowlist, minus
// the shared Cloudinary host.
const trustedImageHosts = ['media.daily.dev', 'klipy.com', 'giphy.com'];
const gifHosts = ['klipy.com', 'giphy.com'];

export const DM_MAX_ATTACHMENTS = 4;

const matchesHost = (url: string, hosts: string[]): boolean => {
  try {
    const { protocol, hostname } = new URL(url);

    return (
      protocol === 'https:' &&
      hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
};

export const isTrustedImageUrl = (url: string): boolean =>
  matchesHost(url, trustedImageHosts);

export type DmBodyPart =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; alt: string; isGif: boolean };

const textPart = (text: string): DmBodyPart[] => {
  const trimmed = text.replace(/^\s*\n|\n\s*$/g, '');

  return trimmed.trim() ? [{ type: 'text', text: trimmed }] : [];
};

export const parseMessageBody = (body: string): DmBodyPart[] => {
  const parts: DmBodyPart[] = [];
  let cursor = 0;

  Array.from(body.matchAll(imageMarkdownRegex)).forEach((match) => {
    const [markdown, alt, url] = match;

    if (!isTrustedImageUrl(url)) {
      return;
    }

    parts.push(...textPart(body.slice(cursor, match.index)));
    parts.push({
      type: 'image',
      url,
      alt,
      isGif: matchesHost(url, gifHosts),
    });
    cursor = match.index + markdown.length;
  });

  parts.push(...textPart(body.slice(cursor)));

  return parts;
};

// A one-line summary for the inbox, where raw markdown would read as noise.
export const getMessagePreview = (body: string): string =>
  parseMessageBody(body)
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }

      return part.isGif ? 'GIF' : 'Image';
    })
    .join(' ');

const cleanAlt = (alt: string): string => alt.replace(/[[\]\n]/g, ' ').trim();

export const toImageMarkdown = (url: string, alt: string): string =>
  `![${cleanAlt(alt)}](${url})`;
