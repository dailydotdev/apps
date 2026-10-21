import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { ExcoPlayerProps } from '@dailydotdev/shared/src/features/monetization/ExcoPlayer';
import { ExcoPlayer } from '@dailydotdev/shared/src/features/monetization/ExcoPlayer';
import { isExcoId } from '@dailydotdev/shared/src/features/monetization/exco';
import type { ExcoFrameMessage } from '@dailydotdev/shared/src/features/monetization/excoFrame';
import {
  excoFrameSource,
  toExcoFrameEventData,
} from '@dailydotdev/shared/src/features/monetization/excoFrame';

/**
 * Embed page that hosts the EX.CO player for the extension, whose pages
 * can't load the player's remote script (see `excoFrame.ts`). Like
 * `/embed/mf` it is static and skips the app shell in `_app.tsx`, and the
 * `frame-ancestors` header in `next.config.ts` limits who can frame it.
 */

// A floating player can't leave the frame, so it stays where it is.
const noSticky: ExcoPlayerProps['sticky'] = {
  desktop: { enabled: false },
  mobile: { enabled: false },
};

// No secrets, so the wildcard target is safe.
const postToParent = (message: ExcoFrameMessage) => {
  if (globalThis.parent !== globalThis.window) {
    globalThis.parent.postMessage(message, '*');
  }
};

export default function ExcoPlayerEmbed(): ReactElement {
  const [ids, setIds] = useState<{ playerId: string; playlistId: string }>();

  useEffect(() => {
    postToParent({ source: excoFrameSource, type: 'ready' });

    const params = new URLSearchParams(globalThis.location.search);
    const playerId = params.get('playerId') ?? '';
    const playlistId = params.get('playlistId') ?? '';

    if (isExcoId(playerId) && isExcoId(playlistId)) {
      setIds({ playerId, playlistId });
    }
  }, []);

  return (
    <>
      {/* base.css gives the body a 320px minimum and a scrollbar, both wider
          than the frame. */}
      <style>
        {
          'html,body{margin:0;min-width:0!important;overflow:hidden!important;background:transparent!important}'
        }
      </style>
      {ids && (
        <ExcoPlayer
          playerId={ids.playerId}
          playlistId={ids.playlistId}
          className="w-full"
          sticky={noSticky}
          onEvent={(name, data) =>
            postToParent({
              source: excoFrameSource,
              type: 'event',
              name,
              data: toExcoFrameEventData(data),
            })
          }
          onError={(reason) =>
            postToParent({ source: excoFrameSource, type: 'error', reason })
          }
        />
      )}
    </>
  );
}
