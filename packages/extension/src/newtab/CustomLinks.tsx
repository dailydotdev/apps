import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import SimpleTooltip from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import MenuIcon from '@dailydotdev/shared/src/components/icons/Menu';
import classNames from 'classnames';
import React, { MouseEventHandler, ReactElement } from 'react';
import { WithClassNameProps } from '@dailydotdev/shared/src/components/utilities';
import { combinedClicks } from '@dailydotdev/shared/src/lib/click';

interface CustomLinksProps extends WithClassNameProps {
  links: string[];
  onOptions?: () => unknown;
  onLinkClick?: MouseEventHandler;
}

const noop = () => undefined;

export function CustomLinks({
  links,
  onOptions,
  className,
  onLinkClick = noop,
}: CustomLinksProps): ReactElement {
  return (
    <div
      className={classNames(
        'hidden laptop:flex flex-row gap-2 p-2 rounded-14 border border-theme-divider-secondary h-fit',
        'hidden h-fit flex-row gap-2 rounded-14 border border-theme-divider-secondary p-2 laptop:flex',
        className,
      )}
    >
      {links.map((url, i) => (
        <a
          href={url}
          rel="noopener noreferrer"
          className={classNames(
            'focus-outline h-8 w-8 overflow-hidden rounded-lg bg-white',
            i >= 4 && 'hidden laptopL:block',
          )}
          key={url}
          {...combinedClicks(onLinkClick)}
        >
          <img
            src={`https://api.daily.dev/icon?url=${encodeURIComponent(
              url,
            )}&size=32`}
            alt={url}
            className="h-full w-full"
          />
        </a>
      ))}
      <SimpleTooltip placement="left" content="Edit shortcuts">
        <Button
          variant={ButtonVariant.Tertiary}
          icon={<MenuIcon />}
          onClick={onOptions}
          size={ButtonSize.Small}
        />
      </SimpleTooltip>
    </div>
  );
}
