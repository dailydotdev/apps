import classNames from 'classnames';
import React, { Fragment, ReactElement, useEffect, useState } from 'react';

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
            <kbd className="flex min-w-5 justify-center rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-0.5 font-sans text-text-tertiary typo-footnote">
              {item}
            </kbd>
            {index !== keys.length - 1 && (
              <span className="mx-1 py-0.5 text-text-tertiary typo-footnote">
                +
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
