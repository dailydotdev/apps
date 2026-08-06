import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useQueryClient } from '@tanstack/react-query';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { WorldIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { fetchUserWorld, userWorldQueryKey } from '../world/useUserWorld';

/** The renderer is fetched once per session at most, however often this is hovered. */
let rendererWarmed = false;

const warmRenderer = () => {
  if (rendererWarmed) {
    return;
  }
  rendererWarmed = true;
  // Same chunk name the world page's next/dynamic uses, so this IS that chunk:
  // by the time the route mounts, the import it makes is already resolved.
  import(/* webpackChunkName: "worldView" */ '../world/WorldView').catch(() => {
    // A failed warm-up is not a failure: the route will ask for it again.
    rendererWarmed = false;
  });
};

const segment =
  'flex items-center gap-1.5 rounded-12 px-3 py-1.5 typo-footnote font-bold transition-colors duration-100';

interface ProfileSideToggleProps {
  user: PublicProfile;
  className?: string;
}

/**
 * The two sides of a reader: the profile they wrote, and the world they read
 * into being. Rendered as one control rather than a link in a menu because the
 * point is that the second one EXISTS — most people arriving at a profile have
 * never seen a world, and a segmented switch is the shape that says there is
 * something on the other side of it.
 *
 * "Fun side" navigates rather than swapping in place: the world is a
 * full-screen WebGL scene with no room for the profile's chrome, and it already
 * owns a route that knows how to get back here.
 *
 * Laptop and up only. The world it opens into is a better place on a big
 * screen — a phone gets the lite renderer, no rail, no scrubber and no bench —
 * so the door is offered where the room behind it is worth walking into. Hidden
 * in CSS rather than by measuring the viewport, so it is in the first paint on
 * a desktop instead of popping in once a hook has resolved.
 */
export function ProfileSideToggle({
  user,
  className,
}: ProfileSideToggleProps): ReactElement {
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const worldHref = `/world/${user.username || user.id}`;

  /* Both halves of the wait, started on intent rather than on click: the ~700KB
     renderer and the districts it needs to raise anything. Hovering the segment
     is a good enough signal, and the two race each other instead of queueing.
     Deliberately hover and focus only — a touchstart also fires when a finger
     lands here on its way to scrolling past, and that is not worth most of a
     megabyte of somebody's data. */
  const onIntent = useCallback(() => {
    warmRenderer();
    queryClient.prefetchQuery({
      queryKey: userWorldQueryKey(user.id),
      queryFn: () => fetchUserWorld(user.id),
      staleTime: StaleTime.Default,
    });
  }, [queryClient, user.id]);

  return (
    <div
      role="group"
      aria-label="Profile sides"
      className={classNames(
        'hidden items-center gap-0.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-0.5 laptop:flex',
        className,
      )}
    >
      <span
        aria-current="page"
        className={classNames(segment, 'bg-surface-float text-text-primary')}
      >
        Professional side
      </span>
      <Link href={worldHref} passHref>
        {/* href is set here as well as by Link, so the anchor reads as one to
            a11y tooling and still resolves with JS off. */}
        <a
          href={worldHref}
          className={classNames(
            segment,
            'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
          )}
          onMouseEnter={onIntent}
          onFocus={onIntent}
          onClick={() =>
            logEvent({
              event_name: LogEvent.Click,
              target_type: TargetType.ProfileWorldToggle,
              target_id: user.id,
            })
          }
        >
          <WorldIcon size={IconSize.Size16} />
          Fun side
        </a>
      </Link>
    </div>
  );
}
