import React, { ReactElement, useEffect, useState } from 'react';
import classNames from 'classnames';
import sizeN from '../../../macros/sizeN.macro';
import FilterMenu from './FilterMenu';
import { ClickableText } from '../buttons/ClickableText';
import FilterIcon from '../../../icons/arrow.svg';

const asideWidth = sizeN(89);

interface FeedFiltersProps {
  isOpen?: boolean;
  onBack?: () => void;
}

let timeout: NodeJS.Timeout;

export default function FeedFilters({
  isOpen,
  onBack,
}: FeedFiltersProps): ReactElement {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (timeout) clearTimeout(timeout);
      setHidden(false);
      return;
    }

    timeout = setTimeout(() => setHidden(true), 300);
  }, [isOpen]);

  return (
    <aside
      className={classNames(
        'fixed top-14 left-0 z-3 bottom-0 self-stretch bg-theme-bg-primary rounded-r-2xl border-t border-r border-theme-divider-primary overflow-y-auto',
        !isOpen && 'pointer-events-none',
        hidden && 'invisible',
      )}
      style={{
        width: asideWidth,
        transform: isOpen ? 'translateX(0)' : `translateX(-${asideWidth})`,
        willChange: 'transform',
        transition: 'transform 0.2s linear 0.1s',
      }}
    >
      <ClickableText
        className="p-4 font-semibold no-underline text-theme-label-tertiary"
        onClick={onBack}
      >
        <FilterIcon className="mr-2 text-2xl -rotate-90" />
        Back
      </ClickableText>
      <div className="border-t border-theme-divider-tertiary" />
      <FilterMenu />
    </aside>
  );
}
