import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon as CloseIcon, SidebarArrowRight } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';

type ReaderChromeProps = {
  post: Post;
  onClose: () => void;
  isRailOpen: boolean;
  onToggleRail: () => void;
  isPostPage?: boolean;
};

export function ReaderChrome({
  onClose,
  isRailOpen,
  onToggleRail,
  isPostPage = false,
}: ReaderChromeProps): ReactElement {
  const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';
  const chromeGroupClasses =
    'pointer-events-auto flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default p-px shadow-3';

  return (
    <div
      className="z-30 pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2"
      role="banner"
    >
      {!isRailOpen ? (
        <div className={chromeGroupClasses} aria-label="Header controls left">
          <Tooltip content="Show discussion">
            <Button
              icon={<SidebarArrowRight />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              type="button"
              className={iconButtonClassName}
              onClick={onToggleRail}
              aria-label="Show discussion panel"
              aria-pressed={false}
            />
          </Tooltip>
        </div>
      ) : (
        <div aria-hidden />
      )}

      {!isPostPage && (
        <div className={chromeGroupClasses} aria-label="Reader actions">
          <Tooltip side="bottom" content="Close">
            <Button
              variant={ButtonVariant.Tertiary}
              icon={<CloseIcon />}
              size={ButtonSize.Small}
              type="button"
              className={iconButtonClassName}
              onClick={onClose}
              aria-label="Close reader"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}
