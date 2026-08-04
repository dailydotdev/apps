import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

/**
 * The frame every screen that stands in for the world shares: booting, empty,
 * failed. It is deliberately one layout: a cold load moves through two of these
 * (the renderer is still on the wire, then the land is being raised) and a
 * reader should see the same screen filling in rather than two screens.
 *
 * It also carries the logo, because it is what is on screen for the whole of a
 * cold load and the frame most likely to be caught in a recording.
 */
export function WorldStage({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div
      data-world-overlay
      className="pointer-events-auto fixed inset-0 z-3 flex flex-col items-center justify-center gap-6 bg-background-default px-6 text-center"
    >
      <Logo
        position={LogoPosition.Initial}
        logoClassName={{ container: 'h-6' }}
      />
      {children}
    </div>
  );
}

/**
 * Whose world this is. Both slots keep their size before the profile is known:
 * the first frame of a statically generated page has no user on it, and an
 * avatar that appears out of nothing would move everything under it.
 */
export function WorldStageIdentity({
  user,
}: {
  user?: PublicProfile;
}): ReactElement {
  return (
    <div className="flex flex-col items-center gap-3">
      {user ? (
        <ProfilePicture
          user={user}
          size={ProfileImageSize.XXLarge}
          nativeLazyLoading
        />
      ) : (
        <div className="h-14 w-14 rounded-16 bg-surface-float" />
      )}
      {/* Inside the Typography either way, so the line box is the same height
          whether it is holding a name or standing in for one. */}
      <Typography type={TypographyType.Title3} bold>
        {user?.name ?? (
          <span className="inline-block h-3 w-32 rounded-max bg-surface-float align-middle" />
        )}
      </Typography>
    </div>
  );
}

interface WorldBootProps {
  user?: PublicProfile;
  /** 0–1 while the land is being raised; absent while the renderer is still on the wire. */
  progress?: number;
  message?: string;
}

export function WorldBoot({
  user,
  progress,
  message,
}: WorldBootProps): ReactElement {
  return (
    <WorldStage>
      <WorldStageIdentity user={user} />
      <div className="flex w-56 max-w-full flex-col items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-max bg-surface-float">
          {/* Nothing can measure a chunk download, so that phase sweeps rather
              than fills: same bar, same place, no second loading screen. */}
          {progress === undefined ? (
            <i className="block h-full w-1/3 animate-meter-shine rounded-max bg-text-primary" />
          ) : (
            <i
              className="block h-full rounded-max bg-text-primary transition-[width] duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          )}
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {message ?? 'Loading the world…'}
        </Typography>
      </div>
    </WorldStage>
  );
}

/**
 * Whose world the renderer is being downloaded for. `next/dynamic` renders its
 * `loading` element in place of the component, so a provider around the view
 * reaches it, which is the only way that screen gets to say a name, and the
 * difference between a skeleton and the right face from the first frame.
 */
export const WorldUserContext = createContext<PublicProfile | undefined>(
  undefined,
);

export function WorldBootFallback(): ReactElement {
  return <WorldBoot user={useContext(WorldUserContext)} />;
}
