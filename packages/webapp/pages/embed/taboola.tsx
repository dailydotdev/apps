import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import classNames from 'classnames';
import type { ThemeMode } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { applyTheme } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  getTaboolaVariantClassName,
  TaboolaPlacement,
} from '@dailydotdev/shared/src/components/cards/ad/TaboolaAd';
import type {
  TaboolaFrameMessage,
  TaboolaFrameParams,
} from '@dailydotdev/shared/src/features/monetization/taboolaFrame';
import {
  isTaboolaThemeMessage,
  parseTaboolaFrameUrl,
  taboolaFrameSource,
} from '@dailydotdev/shared/src/features/monetization/taboolaFrame';
import { taboolaSimDomainParam } from '@dailydotdev/shared/src/features/monetization/taboola';

/**
 * Embed page that renders a Taboola placement for the extension, whose pages
 * can't load Taboola's remote script (see `taboolaFrame.ts`). Like
 * `/embed/exco` it is static and skips the app shell in `_app.tsx`, and the
 * `frame-ancestors` header in `next.config.ts` limits who can frame it. Each
 * frame is its own Taboola page view, on the webapp's home page.
 */

// The webapp's home, which is what the extension's new tab stands in for.
const getPageUrl = ({ simDomain }: TaboolaFrameParams): string => {
  const url = new URL(webappUrl, globalThis.location.href);

  if (simDomain) {
    url.searchParams.set(taboolaSimDomainParam, simDomain);
  }

  return url.toString();
};

// No secrets, so the wildcard target is safe.
const postToParent = (message: TaboolaFrameMessage) => {
  if (globalThis.parent !== globalThis.window) {
    globalThis.parent.postMessage(message, '*');
  }
};

export default function TaboolaEmbed(): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [params, setParams] = useState<TaboolaFrameParams>();

  useEffect(() => {
    postToParent({ source: taboolaFrameSource, type: 'ready' });
    const parsed = parseTaboolaFrameUrl(globalThis.location.search);

    if (!parsed) {
      postToParent({
        source: taboolaFrameSource,
        type: 'result',
        result: 'empty',
      });
      return;
    }

    if (parsed.theme) {
      applyTheme(parsed.theme as ThemeMode);
    }

    setParams(parsed);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === globalThis.parent &&
        isTaboolaThemeMessage(event.data)
      ) {
        applyTheme(event.data.theme as ThemeMode);
      }
    };

    globalThis.addEventListener('message', onMessage);

    return () => globalThis.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const observer = new ResizeObserver(() =>
      postToParent({
        source: taboolaFrameSource,
        type: 'height',
        height: Math.ceil(root.getBoundingClientRect().height),
      }),
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, [params]);

  return (
    <>
      <Head>
        {/* An item opens in a tab of its own, never inside the frame. */}
        <base target="_blank" />
      </Head>
      {/* base.css gives the body a 320px minimum and a scrollbar, both wider
          than the frame. A color scheme other than the frame element's paints
          an opaque backdrop behind the page, and shell.css sets one on narrow
          screens, which the frame always is. */}
      <style>
        {
          'html,body,#__next{height:100%;margin:0;min-width:0!important;overflow:hidden!important;background:transparent!important}html{color-scheme:normal!important}'
        }
      </style>
      {params && (
        // The listener only reports clicks; the link does the navigating.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          ref={rootRef}
          className={classNames(
            getTaboolaVariantClassName(params.variant),
            params.isShortCover && 'taboola-feed-ad--short-cover',
            params.variant !== 'list' && 'flex h-full flex-col',
          )}
          onClickCapture={() =>
            postToParent({ source: taboolaFrameSource, type: 'click' })
          }
        >
          <TaboolaPlacement
            placement={params.placement}
            variant={params.variant}
            url={getPageUrl(params)}
            onResult={(result) =>
              postToParent({
                source: taboolaFrameSource,
                type: 'result',
                result,
              })
            }
          />
        </div>
      )}
    </>
  );
}
