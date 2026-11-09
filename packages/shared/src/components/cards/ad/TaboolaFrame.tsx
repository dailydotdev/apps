import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { TaboolaResult } from '../../../features/monetization/taboola';
import { getTaboolaSimDomain } from '../../../features/monetization/taboola';
import type { TaboolaVariant } from '../../../features/monetization/taboolaFrame';
import {
  getTaboolaFrameUrl,
  isTaboolaFrameMessage,
  taboolaFrameSource,
} from '../../../features/monetization/taboolaFrame';
import { ThemeMode } from '../../../contexts/SettingsContext';

const readyTimeout = 5_000;

const getTheme = (): ThemeMode | undefined =>
  [ThemeMode.Light, ThemeMode.Auto].find((theme) =>
    globalThis.document?.documentElement.classList.contains(theme),
  );

interface TaboolaFrameProps {
  placement: number;
  variant: TaboolaVariant;
  isShortCover?: boolean;
  onResult: (result: TaboolaResult) => void;
  onClick?: () => void;
  className?: string;
}

/**
 * A Taboola placement for the extension: the embed page renders it on the
 * webapp origin and reports back over postMessage. In a list the frame takes
 * the height its content reports; elsewhere it fills the card.
 */
export function TaboolaFrame({
  placement,
  variant,
  isShortCover,
  onResult,
  onClick,
  className,
}: TaboolaFrameProps): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();
  const [src] = useState(() =>
    getTaboolaFrameUrl({
      placement,
      variant,
      theme: getTheme(),
      isShortCover,
      simDomain: getTaboolaSimDomain(),
    }),
  );
  const isReadyRef = useRef(false);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  // A frame-ancestors refusal or a network error still fires `load`, with the
  // browser's error page in the frame instead of ours.
  const onLoad = () => {
    if (!isReadyRef.current) {
      readyTimerRef.current = setTimeout(() => {
        if (!isReadyRef.current) {
          onResultRef.current('empty');
        }
      }, readyTimeout);
    }
  };

  useEffect(() => () => clearTimeout(readyTimerRef.current), []);

  const postTheme = useCallback(
    () =>
      frameRef.current?.contentWindow?.postMessage(
        {
          source: taboolaFrameSource,
          type: 'theme',
          theme: getTheme() ?? ThemeMode.Dark,
        },
        new URL(src, globalThis.location.href).origin,
      ),
    [src],
  );

  // The theme can change before the frame listens, so it goes again on ready.
  useEffect(() => {
    const observer = new MutationObserver(postTheme);
    observer.observe(globalThis.document.documentElement, {
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [postTheme]);

  useEffect(() => {
    const frameOrigin = new URL(src, globalThis.location.href).origin;
    const onMessage = (event: MessageEvent) => {
      if (
        !frameRef.current ||
        event.source !== frameRef.current.contentWindow ||
        event.origin !== frameOrigin ||
        !isTaboolaFrameMessage(event.data)
      ) {
        return;
      }

      const { data } = event;

      if (data.type === 'ready') {
        isReadyRef.current = true;
        postTheme();
      } else if (data.type === 'result') {
        onResultRef.current(data.result);
      } else if (data.type === 'height') {
        setHeight(data.height);
      } else {
        onClickRef.current?.();
      }
    };

    globalThis.addEventListener('message', onMessage);

    return () => globalThis.removeEventListener('message', onMessage);
  }, [postTheme, src]);

  return (
    <iframe
      ref={frameRef}
      src={src}
      title="Sponsored content"
      onLoad={onLoad}
      className={classNames(
        // The embed page's own, or the frame paints an opaque backdrop.
        'block w-full border-0 bg-transparent [color-scheme:normal]',
        variant !== 'list' && 'min-h-0 flex-1',
        className,
      )}
      style={variant === 'list' ? { height } : undefined}
    />
  );
}
