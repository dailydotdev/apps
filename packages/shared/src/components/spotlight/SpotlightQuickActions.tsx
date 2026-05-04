import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DocsIcon, HashtagIcon, SquadIcon, UserIcon } from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { isAppleDevice } from '../../lib/func';
import { useSpotlight } from './useSpotlight';
import { scopeMeta, SpotlightScope } from './types';

interface SpotlightQuickActionsProps {
  className?: string;
}

const altLabel = isAppleDevice() ? '⌥' : 'Alt';

const scopeIcons: Record<
  Exclude<SpotlightScope, SpotlightScope.All>,
  ComponentType<IconProps>
> = {
  [SpotlightScope.Posts]: DocsIcon,
  [SpotlightScope.Squads]: SquadIcon,
  [SpotlightScope.People]: UserIcon,
  [SpotlightScope.Tags]: HashtagIcon,
};

/**
 * Apple-Tahoe-style quick-action icon row that lives next to the trigger
 * pill in the header. Each button opens Spotlight pre-scoped to one entity
 * type and announces its `Alt+1..4` shortcut via tooltip.
 */
export const SpotlightQuickActions = ({
  className,
}: SpotlightQuickActionsProps): ReactElement => {
  const { openWithScope } = useSpotlight();

  return (
    <div
      role="group"
      aria-label="Quick search scopes"
      className={classNames(
        'hidden items-center gap-1.5 tablet:flex',
        className,
      )}
    >
      {(
        Object.entries(scopeMeta) as Array<
          [
            Exclude<SpotlightScope, SpotlightScope.All>,
            (typeof scopeMeta)[Exclude<SpotlightScope, SpotlightScope.All>],
          ]
        >
      ).map(([scope, meta]) => {
        const Icon = scopeIcons[scope];
        return (
          <Tooltip
            key={scope}
            content={
              <span>
                {meta.triggerLabel}{' '}
                <span className="opacity-70">
                  {altLabel}+{meta.shortcutIndex}
                </span>
              </span>
            }
          >
            <button
              type="button"
              aria-label={`${meta.triggerLabel} (${altLabel}+${meta.shortcutIndex})`}
              aria-keyshortcuts={`Alt+${meta.shortcutIndex}`}
              data-testid={`spotlight-quickaction-${scope}`}
              onClick={() => openWithScope(scope)}
              className="group/quickaction flex size-10 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-subtle text-text-tertiary transition-all hover:border-border-subtlest-secondary hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2"
            >
              <Icon size={IconSize.Small} aria-hidden />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default SpotlightQuickActions;
