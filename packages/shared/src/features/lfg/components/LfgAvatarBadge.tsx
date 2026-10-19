import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../../components/Icon';
import { SignalIcon } from '../../../components/icons/Signal';
import { useLfgEnabled } from '../hooks/useLfgEnabled';
import type { LfgKind } from '../types';
import { lfgKindLooking } from '../constants';

export enum LfgBadgeSize {
  // Avatars up to 24px.
  Small = 'small',
  Default = 'default',
  // The larger "LFG" tag for profile-sized avatars.
  Ribbon = 'ribbon',
}

const ringClassName =
  'ring-2 ring-accent-avocado-default ring-offset-2 ring-offset-background-default';

// The mark on an avatar, positioned inside a `relative` wrapper.
export const LfgBadgeMark = ({
  size = LfgBadgeSize.Default,
  className,
}: {
  size?: LfgBadgeSize;
  className?: string;
}): ReactElement => {
  if (size === LfgBadgeSize.Ribbon) {
    return (
      <span
        aria-hidden
        className={classNames(
          'absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-white ring-2 ring-background-default typo-caption2',
          className,
        )}
      >
        <SignalIcon size={IconSize.XXSmall} secondary />
        LFG
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={classNames(
        'absolute flex items-center justify-center bg-accent-avocado-default text-white ring-2 ring-background-default',
        size === LfgBadgeSize.Small
          ? '-bottom-1 -right-1 size-3.5 rounded-4'
          : '-bottom-1.5 -right-1.5 size-[1.125rem] rounded-6',
        className,
      )}
    >
      <SignalIcon size={IconSize.XXSmall} secondary />
    </span>
  );
};

export const lfgAvatarRingClassName = ringClassName;

interface LfgAvatarBadgeProps {
  kind?: LfgKind | null;
  name?: string;
  size?: LfgBadgeSize;
  // The avatar's own rounding, so the ring follows it.
  rounded?: string;
  className?: string;
  children: ReactNode;
}

const Badged = ({
  kind,
  name,
  size = LfgBadgeSize.Default,
  rounded = 'rounded-12',
  className,
  children,
}: LfgAvatarBadgeProps & { kind: LfgKind }): ReactElement => {
  const { isEnabled } = useLfgEnabled();

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <span
      className={classNames(
        'relative inline-flex shrink-0',
        rounded,
        ringClassName,
        className,
      )}
      title={name ? `${name}: ${lfgKindLooking[kind]}` : lfgKindLooking[kind]}
    >
      {children}
      <LfgBadgeMark size={size} />
    </span>
  );
};

// Anyone with an open post wears this wherever their avatar shows up, for
// readers who have Looking for group. Most avatars have no post, so they skip
// the flag lookup altogether.
export const LfgAvatarBadge = ({
  kind,
  ...props
}: LfgAvatarBadgeProps): ReactElement =>
  kind ? <Badged kind={kind} {...props} /> : <>{props.children}</>;
