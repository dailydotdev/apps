import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { ArrowIcon } from '../icons';
import { IconSize } from '../Icon';
import { VALUE_RAILS } from './ValueRails';

// =============================================================
// The rail is a channel, not a fixture.
//
// Ten rails is ten opinions about what a reader wants under their
// feed, and the honest answer is that it differs per reader. So
// the rail's label — which was already the throwaway element,
// sitting where the browser's URL tooltip lands — becomes the
// control that swaps it. Nothing else on the row moves, and the
// dropdown costs no space it was not already spending.
//
// The choice is stored locally rather than on the account: it is
// a preference about one strip, it should survive a reload, and
// it is not worth a round trip or a migration.
// =============================================================

const STORAGE_KEY = 'sponsorRail';
const DEFAULT_RAIL = 'hot';

const railById = (id: string) =>
  VALUE_RAILS.find((rail) => rail.id === id) ?? VALUE_RAILS[0];

export const ValueRailSwitcher = (): ReactElement => {
  const [id, setId] = useState(DEFAULT_RAIL);

  // Read after mount, not during render: the server has no
  // localStorage, and reading it in a useState initialiser would
  // make the two disagree on the first paint.
  useEffect(() => {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (stored && VALUE_RAILS.some((rail) => rail.id === stored)) {
      setId(stored);
    }
  }, []);

  const select = useCallback((next: string) => {
    setId(next);
    globalThis.localStorage?.setItem(STORAGE_KEY, next);
  }, []);

  const { Rail, name } = railById(id);

  const label = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-haspopup="menu"
          aria-label={`Change rail — currently ${name}`}
          className="flex items-center gap-1 whitespace-nowrap rounded-6 px-1 py-0.5 text-text-quaternary transition-colors duration-150 typo-caption2 hover:bg-surface-float hover:text-text-secondary"
          type="button"
        >
          {name}
          <ArrowIcon className="rotate-180" size={IconSize.XXSmall} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="!min-w-[12rem]">
        <DropdownMenuOptions
          options={VALUE_RAILS.map((rail) => ({
            label: rail.name,
            action: () => select(rail.id),
          }))}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return <Rail label={label} />;
};

export default ValueRailSwitcher;
