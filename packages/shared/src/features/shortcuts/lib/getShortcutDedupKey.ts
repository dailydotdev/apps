import { withHttps } from '../../../lib/links';

/**
 * Normalized comparison key used only for shortcut duplicate detection.
 * We keep query/hash so distinct pages can still coexist as separate tiles.
 */
export const getShortcutDedupKey = (url: string): string | null => {
  try {
    const parsed = new URL(withHttps(url));
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, '');
    const port = parsed.port ? `:${parsed.port}` : '';

    return `${parsed.protocol.toLowerCase()}//${hostname}${port}${pathname}${
      parsed.search
    }${parsed.hash}`;
  } catch {
    return null;
  }
};
