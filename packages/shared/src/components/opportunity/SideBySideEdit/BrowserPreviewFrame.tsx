import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CopyIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { useCopyLink } from '../../../hooks/useCopy';

export interface BrowserPreviewFrameProps {
  url: string;
  children: ReactNode;
  className?: string;
}

export function BrowserPreviewFrame({
  url,
  children,
  className,
}: BrowserPreviewFrameProps): ReactElement {
  const [copying, copyLink] = useCopyLink(() => url);

  return (
    <div
      className={classNames(
        'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary bg-surface-float px-2 py-1">
        <div className="flex shrink-0 items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-text-disabled" />
          <div className="h-2 w-2 rounded-full bg-text-disabled" />
          <div className="h-2 w-2 rounded-full bg-text-disabled" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <div className="flex min-w-0 max-w-lg flex-1 items-center gap-1 rounded-4 bg-background-subtle px-2 py-0.5">
            <span className="min-w-0 flex-1 truncate text-center text-xs text-text-tertiary">
              {url}
            </span>
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<CopyIcon size={IconSize.XSmall} />}
              onClick={() => copyLink()}
              className="shrink-0 !p-0"
              title={copying ? 'Copied!' : 'Copy URL'}
            />
          </div>
        </div>

        <div className="w-10 shrink-0" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}

export default BrowserPreviewFrame;
