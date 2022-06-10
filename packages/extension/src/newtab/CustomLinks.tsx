import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import MenuIcon from '@dailydotdev/shared/src/components/icons/Menu';
import classNames from 'classnames';
import React, { ReactElement } from 'react';

interface CustomLinksProps {
  links: string[];
  onOptions?: () => unknown;
}

export function CustomLinks({
  links,
  onOptions,
}: CustomLinksProps): ReactElement {
  return (
    <div className="hidden laptop:flex flex-row gap-2 p-2 rounded-14 border border-theme-divider-secondary">
      {links.map((url, i) => (
        <a
          href={url}
          rel="noopener noreferrer"
          className={classNames(
            'focus-outline w-8 h-8 rounded-lg overflow-hidden bg-white',
            i >= 4 && 'hidden laptopL:block',
          )}
          key={url}
        >
          <img
            src={`https://api.daily.dev/icon?url=${encodeURIComponent(
              url,
            )}&size=32`}
            alt={url}
            className="w-full h-full"
          />
        </a>
      ))}
      <SimpleTooltip placement="left" content="Edit shortcuts">
        <Button
          className="btn-tertiary"
          icon={<MenuIcon />}
          onClick={onOptions}
          buttonSize="small"
        />
      </SimpleTooltip>
    </div>
  );
}
