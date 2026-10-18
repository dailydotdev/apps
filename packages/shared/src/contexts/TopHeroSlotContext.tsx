import { createContextProvider } from '@kickass-coderz/react';
import type { ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { safeContextHookExport } from '../lib/func';

type TopHeroSlot = {
  slot: HTMLElement | null;
  setSlot?: (slot: HTMLElement | null) => void;
};

const [TopHeroSlotProvider, useTopHeroSlotHook] = createContextProvider(
  (): TopHeroSlot => {
    const [slot, setSlot] = useState<HTMLElement | null>(null);

    return useMemo(() => ({ slot, setSlot }), [slot]);
  },
  {
    errorMessage: 'ContextNotFound',
  },
);

const useTopHeroSlot = safeContextHookExport(
  useTopHeroSlotHook,
  'ContextNotFound',
  { slot: null },
);

/**
 * Renders into the v2 shell's top-hero strip. The feed that owns a card
 * keeps deciding whether it shows; the layout variant only moves it here.
 */
const TopHeroPortal = ({
  children,
}: {
  children: ReactNode;
}): ReactElement | null => {
  const { slot } = useTopHeroSlot();

  return slot ? createPortal(children, slot) : null;
};

export { TopHeroSlotProvider, TopHeroPortal, useTopHeroSlot };
