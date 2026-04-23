import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';

const QUERY_PARAM = 'focus-blocked';

// Renders a compact banner at the top of the new tab page whenever the user
// was redirected here by the focus blocker. Self-contained so any page that
// may receive the redirect (currently only MainFeedPage) can drop it in.
export const FocusBlockedBanner = (): ReactElement | null => {
  const [blockedHost, setBlockedHost] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const host = params.get(QUERY_PARAM);
    if (!host) {
      return;
    }
    setBlockedHost(host);

    // Strip the query param so refreshes don't re-show the banner after the
    // session ends. `replaceState` keeps history clean.
    params.delete(QUERY_PARAM);
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ''}${
      window.location.hash
    }`;
    window.history.replaceState(null, '', url);
  }, []);

  if (!blockedHost) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative z-popup flex w-full flex-col items-start gap-1 bg-accent-cabbage-default px-4 py-3 text-white laptop:flex-row laptop:items-center laptop:justify-center laptop:gap-3"
    >
      <Typography
        type={TypographyType.Footnote}
        bold
        color={TypographyColor.Primary}
      >
        Focus in progress.
      </Typography>
      <Typography type={TypographyType.Footnote}>
        You tried to visit <strong>{blockedHost}</strong>. We&apos;ll let you
        back in when your session ends.
      </Typography>
    </div>
  );
};
