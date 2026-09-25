import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { isPostPermalinkPath } from '../lib/postRoutes';

// Post permalinks arrive from the API as absolute production URLs.
const PERMALINK_HOSTS = ['daily.dev', 'app.daily.dev'];

const toAppUrl = (href: string): URL | undefined => {
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return undefined;
  }
  const isOwnHost =
    url.host === window.location.host || PERMALINK_HOSTS.includes(url.hostname);
  return isOwnHost ? url : undefined;
};

type CurrentPost = Partial<Pick<Post, 'id' | 'slug'>>;

const toArticleUrl = (
  url: URL,
  currentPost?: CurrentPost,
): string | undefined => {
  if (!isPostPermalinkPath(url.pathname)) {
    return undefined;
  }
  const id = url.pathname.slice('/posts/'.length);
  // Permalinks carry the slug while this page may be on the id: links to the
  // post itself (comment permalinks) keep the current path, so they stay
  // same-page updates rather than a reload.
  const isCurrentPost = id === currentPost?.id || id === currentPost?.slug;
  const pathname = isCurrentPost ? window.location.pathname : `/articles/${id}`;
  return `${pathname}${url.search}${url.hash}`;
};

// Profiles, tags, sources, feeds: any app page other than /articles or this one.
const isOtherAppPage = (url: URL): boolean =>
  !url.pathname.startsWith('/articles/') &&
  url.pathname !== window.location.pathname;

// Text rather than a link. pointer-events also covers Next's Link, which
// routes from its own props on click, and the hover cards some links open.
const disableAnchor = (anchor: HTMLAnchorElement): void => {
  anchor.removeAttribute('href');
  anchor.setAttribute('tabindex', '-1');
  anchor.style.setProperty('pointer-events', 'none');
};

const rewriteAnchor = (
  anchor: HTMLAnchorElement,
  currentPost?: CurrentPost,
): void => {
  const href = anchor.getAttribute('href');
  const url = href ? toAppUrl(href) : undefined;
  if (!url) {
    return;
  }
  const articleUrl = toArticleUrl(url, currentPost);
  if (articleUrl) {
    anchor.setAttribute('href', articleUrl);
    return;
  }
  // Page content only: modals such as login carry legal links that must work.
  if (anchor.closest('main') && isOtherAppPage(url)) {
    disableAnchor(anchor);
  }
};

/**
 * Keeps visitors of the /articles template inside it: every link on the page
 * to a post page leads to the same post's /articles version instead, and
 * links in the page content to any other app page (author profiles, tags,
 * mentions) turn into plain text. Post types the template does not render
 * redirect back to /posts from there.
 *
 * Done on the DOM rather than in each widget, since post links come from
 * dozens of shared components. Hrefs are rewritten as they render, so hover
 * and open-in-new-tab show the right target, and plain clicks load the page
 * in full: Next's Link would otherwise route to the href it was given.
 */
export const useArticlePostLinks = (
  enabled: boolean,
  currentPost?: CurrentPost,
): void => {
  const router = useRouter();
  const currentId = currentPost?.id;
  const currentSlug = currentPost?.slug;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const current = { id: currentId, slug: currentSlug };
    const rewrite = (anchor: HTMLAnchorElement) =>
      rewriteAnchor(anchor, current);
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(rewrite);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.target instanceof HTMLAnchorElement) {
            rewrite(mutation.target);
          }
          return;
        }
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) {
            return;
          }
          if (node instanceof HTMLAnchorElement) {
            rewrite(node);
          }
          node.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(rewrite);
        });
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributeFilter: ['href'],
    });

    const onClick = (event: MouseEvent): void => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!anchor || anchor.getAttribute('target') === '_blank') {
        return;
      }
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('/articles/')) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (
        new URL(href, window.location.href).pathname ===
        window.location.pathname
      ) {
        router.push(href, undefined, { shallow: true, scroll: false });
        return;
      }
      window.location.assign(href);
    };
    document.addEventListener('click', onClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick, true);
    };
  }, [enabled, currentId, currentSlug, router]);
};
