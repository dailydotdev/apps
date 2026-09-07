import { useCallback, useEffect, useRef, useState } from 'react';
import { ThemeMode, useSettingsContext } from '../contexts/SettingsContext';
import {
  PREFERRED_SOURCE_SCRIPT_ID,
  PREFERRED_SOURCE_SRC,
} from '../lib/preferredSources';

type PreferredSourceTheme = 'light' | 'dark';

type PreferredSourceApi = {
  init: (options: { theme?: PreferredSourceTheme; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var PREFERRED_SOURCE: Array<(api: PreferredSourceApi) => void> | undefined;
}

const resolveTheme = (mode: ThemeMode): PreferredSourceTheme => {
  if (mode === ThemeMode.Auto) {
    return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  return mode === ThemeMode.Light ? 'light' : 'dark';
};

/**
 * Loads Google's publisher script in `manual` mode and hands back a trigger.
 *
 * Manual mode is not optional for us. The documented drop-in — an empty
 * `<div google-add-preferred-source-btn>` — is scanned once, when the script
 * loads, and every post page in the webapp is reached by a client-side route
 * change long after that. The auto-scan would find nothing. Manual mode also
 * lets us keep our own `Button` instead of the iframe Google renders, which
 * cannot inherit our tokens and adds a per-embed layout shift.
 *
 * The script is fetched on demand rather than from `<head>`, so a post page that
 * never shows the widget never pays for it.
 */
export const useGooglePreferredSource = ({
  enabled = true,
  lang,
}: {
  enabled?: boolean;
  lang?: string;
} = {}): { isReady: boolean; addPreferredSource: () => void } => {
  const { themeMode } = useSettingsContext();
  const [isReady, setIsReady] = useState(false);
  const apiRef = useRef<PreferredSourceApi>();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    let cancelled = false;

    const onApi = (api: PreferredSourceApi) => {
      if (cancelled) {
        return;
      }

      apiRef.current = api;
      api.init({ theme: resolveTheme(themeMode), lang });
      setIsReady(true);
    };

    globalThis.PREFERRED_SOURCE = globalThis.PREFERRED_SOURCE || [];
    globalThis.PREFERRED_SOURCE.push(onApi);

    if (!document.getElementById(PREFERRED_SOURCE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = PREFERRED_SOURCE_SCRIPT_ID;
      script.src = PREFERRED_SOURCE_SRC;
      script.async = true;
      script.setAttribute('preferred-sources-control', 'manual');
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, lang, themeMode]);

  const addPreferredSource = useCallback(() => {
    apiRef.current?.addPreferredSource();
  }, []);

  return { isReady, addPreferredSource };
};
