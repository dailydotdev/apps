import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../dropdown/DropdownMenu';
import { Checkbox } from '../../fields/Checkbox';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';
import { ArrowIcon, InfoIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { TruncateText } from '../../utilities';
import type { Squad } from '../../../graphql/sources';
import { MAX_AUDIENCE_SQUADS, isUserAudience } from './useComposerAudience';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';

interface AudienceChipProps {
  audiences: Squad[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  userAudienceId: string | undefined;
  disabled?: boolean;
}

const AvatarStack = ({
  audiences,
}: {
  audiences: Squad[];
}): ReactElement | null => {
  const visible = audiences.slice(0, 3);
  if (visible.length === 0) {
    return null;
  }
  return (
    <span className="flex shrink-0 items-center -space-x-1">
      {visible.map((audience) => (
        <SourceAvatar
          key={audience.id}
          source={audience}
          size={ProfileImageSize.XSmall}
          className="!mr-0 ring-2 ring-background-default"
        />
      ))}
    </span>
  );
};

export const AudienceChip = ({
  audiences,
  selectedIds,
  onChange,
  userAudienceId,
  disabled,
}: AudienceChipProps): ReactElement | null => {
  const [open, setOpen] = useState(false);
  // Under tablet the menu is a sheet and takes a sheet's title row.
  const isSheet = useViewSize(ViewSize.MobileL);

  const selected = audiences.filter(
    (audience) => !!audience.id && selectedIds.includes(audience.id),
  );
  const primary = selected[0];
  if (!primary) {
    return null;
  }

  const isMulti = selected.length > 1;
  const canPickAudience = audiences.length > 1;
  const showChevron = !disabled && canPickAudience;
  const triggerLabel = (() => {
    if (isMulti) {
      return `${selected.length} audiences`;
    }
    return isUserAudience(primary) ? 'Everyone' : primary.name;
  })();
  const buildAriaLabel = (): string => {
    if (!canPickAudience) {
      return `Posting to ${triggerLabel}`;
    }
    if (isMulti) {
      return `Posting to ${selected.length} audiences. Open audience menu.`;
    }
    return `Posting to ${triggerLabel}. Open audience menu.`;
  };
  const showSinglePrimaryAvatar = !isMulti && !isUserAudience(primary);

  const isEveryoneSelected =
    !!userAudienceId && selectedIds.includes(userAudienceId);
  const selectedSquadCount = selected.filter(
    (audience) => !isUserAudience(audience),
  ).length;
  const isAtSquadLimit = selectedSquadCount >= MAX_AUDIENCE_SQUADS;

  const toggleEveryone = () => {
    if (!userAudienceId) {
      return;
    }
    if (isEveryoneSelected) {
      if (selectedSquadCount === 0) {
        return; // last-resort floor — keep Everyone selected
      }
      onChange(selectedIds.filter((id) => id !== userAudienceId));
      return;
    }
    onChange([...selectedIds, userAudienceId]);
  };

  const toggleSquad = (squad: Squad) => {
    const { id } = squad;
    if (!id) {
      return;
    }
    if (selectedIds.includes(id)) {
      const remaining = selectedIds.filter((entry) => entry !== id);
      if (remaining.length === 0) {
        onChange(userAudienceId ? [userAudienceId] : [id]);
        return;
      }
      onChange(remaining);
      return;
    }
    if (isAtSquadLimit) {
      return;
    }
    onChange([...selectedIds, id]);
  };

  const toggleOption = (option: Squad) => {
    if (isUserAudience(option)) {
      toggleEveryone();
      return;
    }
    toggleSquad(option);
  };

  const selectSingleOption = (option: Squad) => {
    if (!option.id) {
      return;
    }
    onChange([option.id]);
  };

  const handleReset = () => {
    if (userAudienceId) {
      onChange([userAudienceId]);
    }
  };

  const canReset = !isEveryoneSelected || selectedSquadCount > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || !canPickAudience}
          aria-haspopup={canPickAudience ? 'menu' : undefined}
          aria-expanded={canPickAudience ? open : undefined}
          aria-label={buildAriaLabel()}
          className={classNames(
            // `shrink` opts back in past the global `flex-shrink: 0` reset.
            'flex min-w-0 max-w-full shrink items-center gap-1.5 rounded-12 px-2.5 py-1 text-text-primary transition-colors typo-callout',
            showChevron && 'hover:bg-surface-float',
            !showChevron && 'cursor-default',
            open && showChevron && 'bg-surface-float',
          )}
        >
          {isMulti ? (
            <AvatarStack audiences={selected} />
          ) : (
            showSinglePrimaryAvatar && (
              <SourceAvatar source={primary} size={ProfileImageSize.XSmall} />
            )
          )}
          <TruncateText className="min-w-0 max-w-48 shrink font-bold">
            {triggerLabel}
          </TruncateText>
          {showChevron && (
            <ArrowIcon
              className={classNames(
                'shrink-0 text-text-tertiary transition-transform',
                open ? 'rotate-0' : 'rotate-180',
              )}
              size={IconSize.Size16}
            />
          )}
        </button>
      </DropdownMenuTrigger>
      {showChevron && (
        <DropdownMenuContent
          align="start"
          variant="field"
          onClick={(event) => event.stopPropagation()}
          className={classNames(
            '!min-w-64 !max-w-72',
            isAtSquadLimit && 'tablet:!pb-0',
          )}
          scrollableClassName=""
        >
          <div
            className={classNames(
              'flex items-center justify-between gap-2',
              isSheet ? 'py-1 pl-4 pr-2' : 'px-3 pb-1 pt-2',
            )}
          >
            <span
              className={
                isSheet
                  ? 'min-w-0 flex-1 truncate font-bold typo-title3'
                  : 'text-text-tertiary typo-caption2'
              }
            >
              Post to
            </span>
            <button
              type="button"
              onClick={handleReset}
              disabled={!canReset}
              className={classNames(
                isSheet
                  ? 'shell-material shell-press shell-hit relative flex h-[2.375rem] shrink-0 items-center rounded-14 px-3 font-bold typo-callout'
                  : 'rounded-6 px-1 transition-colors typo-caption1',
                canReset &&
                  (isSheet
                    ? 'text-text-primary'
                    : 'text-text-link hover:underline'),
                !canReset && 'cursor-default text-text-disabled',
                !canReset && isSheet && 'pointer-events-none',
              )}
            >
              Reset
            </button>
          </div>
          {/* A popover scrolls its list under the header; a phone's sheet
              scrolls as one piece, like every other sheet. */}
          <div className="flex flex-col gap-px tablet:max-h-60 tablet:overflow-y-auto">
            {audiences.map((option) => {
              const isSelected = !!option.id && selectedIds.includes(option.id);
              const reachedLimit =
                !isSelected && !isUserAudience(option) && isAtSquadLimit;
              const optionLabel = isUserAudience(option)
                ? 'Everyone'
                : option.name;
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={(event: Event) => {
                    if (!option.id) {
                      event.preventDefault();
                      return;
                    }
                    selectSingleOption(option);
                  }}
                  className="gap-2 !overflow-visible tablet:!h-9 tablet:!px-2"
                >
                  <SourceAvatar
                    source={option}
                    size={ProfileImageSize.XSmall}
                    className="!mr-0 shrink-0"
                  />
                  <span
                    className={classNames(
                      'min-w-0 flex-1 truncate text-left typo-callout',
                      isSelected && 'font-bold text-text-primary',
                    )}
                  >
                    {optionLabel}
                  </span>
                  <span
                    role="presentation"
                    className="flex size-5 shrink-0 items-center justify-center"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      name="audiences[]"
                      checked={isSelected}
                      disabled={reachedLimit}
                      className="!p-0 !pr-0"
                      checkmarkClassName="!mr-0"
                      onChange={() => {
                        if (reachedLimit) {
                          return;
                        }
                        toggleOption(option);
                      }}
                    >
                      <span className="sr-only">
                        Toggle {optionLabel} for multi-audience posting
                      </span>
                    </Checkbox>
                  </span>
                </DropdownMenuItem>
              );
            })}
          </div>
          {isAtSquadLimit && (
            <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary bg-surface-float px-4 py-2 text-text-secondary typo-caption1 tablet:px-3">
              <InfoIcon
                size={IconSize.Size16}
                secondary
                className="shrink-0 text-status-info"
              />
              <span className="font-bold">
                You can post to up to {MAX_AUDIENCE_SQUADS} squads
              </span>
            </div>
          )}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
