import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { Fragment, useEffect, useState } from 'react';

export type KeyboadShortcutLabelProps = {
  className?: string;
  keys: string[];
};

export const KeyboadShortcutLabel = ({
  className,
  keys,
}: KeyboadShortcutLabelProps): ReactElement => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // keyboard shortcut buttons are most of the times dependant
    // on browser features so we don't render them in SSR to
    // avoid hydration mismatches
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={classNames(className, 'flex')}>
      {keys.map((item, index) => {
        return (
          <Fragment key={item}>
            <kbd className="rounded-8 border-border-subtlest-tertiary bg-background-subtle text-text-tertiary typo-footnote flex min-w-5 justify-center border px-2 py-0.5 font-sans">
              {item}
            </kbd>
            {index !== keys.length - 1 && (
              <span className="text-text-tertiary typo-footnote mx-1 py-0.5">
                +
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
