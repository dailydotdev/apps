import type { ReactElement } from 'react';
import React from 'react';
import SharedHijackingLoginStrip from '@dailydotdev/shared/src/components/auth/HijackingLoginStrip';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';

// The new tab's strip: layout v2 drops the shortcuts slot it renders in, so
// it only evaluates the experiment once the layout has resolved to v1.
export default function HijackingLoginStrip(): ReactElement | null {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2, isLoading: isLayoutLoading } = useLayoutVariant();
  // Below laptop the layout hook never evaluates, so its `isLoading` stays
  // true for good. Only above it does that flag mean "still resolving".
  const isLayoutResolved = !isLaptop || !isLayoutLoading;

  return (
    <SharedHijackingLoginStrip
      onboardingHandoff
      enabled={isLayoutResolved && !isV2}
      className="mb-4"
    />
  );
}
