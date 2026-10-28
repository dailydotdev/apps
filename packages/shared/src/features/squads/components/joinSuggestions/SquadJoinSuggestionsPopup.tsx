import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Origin } from '../../../../lib/log';
import { useSquadJoinSuggestion } from '../../hooks/useSquadJoinSuggestion';

const SquadJoinSuggestions = dynamic(() =>
  import(
    /* webpackChunkName: "squadJoinSuggestions" */ './SquadJoinSuggestions'
  ).then((mod) => mod.SquadJoinSuggestions),
);

// Phones keep it at the top, clear of the bottom navigation. From laptop it
// sits above the feedback button, which docks above the sponsor strip.
const popupClassName =
  'fixed inset-x-4 z-max bg-background-popover shadow-2 top-safe-offset-4 laptop:bottom-[calc(5.5rem_+_var(--sponsor-strip-height,0rem))] laptop:left-auto laptop:right-4 laptop:top-auto laptop:w-80';

// Floats over the page after a join anywhere but the squad's own page, which
// shows the suggestions under its header instead.
export const SquadJoinSuggestionsPopup = (): ReactElement | null => {
  const { events } = useRouter();
  const { suggestion, closeSuggestion } = useSquadJoinSuggestion();

  // Leaving the page takes the suggestions with it, but the feed's post modal
  // pushes shallow and stays on the page
  useEffect(() => {
    if (!suggestion) {
      return undefined;
    }

    const onNavigate = (url?: string, options?: { shallow?: boolean }) => {
      if (options?.shallow) {
        return;
      }

      const [nextPath] = url?.split(/[?#]/) ?? [];

      if (nextPath && nextPath === globalThis.window?.location.pathname) {
        return;
      }

      closeSuggestion();
    };

    events.on('routeChangeStart', onNavigate);
    return () => events.off('routeChangeStart', onNavigate);
  }, [events, suggestion, closeSuggestion]);

  if (!suggestion || suggestion.origin === Origin.SquadPage) {
    return null;
  }

  return (
    <SquadJoinSuggestions
      key={suggestion.squad.id}
      suggestion={suggestion}
      onClose={closeSuggestion}
      className={popupClassName}
    />
  );
};
