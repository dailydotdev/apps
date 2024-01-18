import classNames from 'classnames';
import React, { Fragment, ReactElement } from 'react';

export type KeyboadShortcutLabelProps = {
  className?: string;
  keys: string[];
};

export const KeyboadShortcutLabel = ({
  className,
  keys,
}: KeyboadShortcutLabelProps): ReactElement => {
  return (
    <div className={classNames(className, 'flex')}>
      {keys.map((item, index) => {
        return (
          <Fragment key={item}>
            <span className="flex min-w-5 justify-center rounded-8 border border-theme-divider-tertiary bg-theme-bg-secondary px-2 py-0.5 text-theme-label-tertiary typo-footnote">
              {item}
            </span>
            {index !== keys.length - 1 && (
              <span className="mx-1 py-0.5 text-theme-label-tertiary typo-footnote">
                +
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
