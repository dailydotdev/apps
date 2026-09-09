import type { ReactElement, ReactNode } from 'react';
import React from 'react';

/**
 * `border-beam` mounts an animated canvas-backed border that jsdom cannot
 * drive: its effect throws on mount, which only a test that waits long enough
 * for the composer's lazy import to resolve ever sees. The beam is decorative,
 * so tests render the frame it wraps and nothing else.
 */
export const BorderBeam = ({
  children,
}: {
  children?: ReactNode;
}): ReactElement => <>{children}</>;
