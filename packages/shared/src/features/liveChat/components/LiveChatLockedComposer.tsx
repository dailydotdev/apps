import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { composerFrame } from '../../interests/components/AgentComposer';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { LockIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

// The composer before the viewer is in: the same frame, locked, with the one
// button that opens it. It stands where the real composer will, so joining
// changes nothing about the room's shape, only what the viewer can do in it.
export const LiveChatLockedComposer = ({
  placeholder,
  action,
  loading,
  failure,
  onAction,
}: {
  placeholder: string;
  action: string;
  loading?: boolean;
  failure?: string;
  onAction: () => void;
}): ReactElement => (
  <div className="flex flex-col gap-1.5 border-t border-border-subtlest-tertiary px-3 py-2">
    {failure && <p className="text-status-error typo-caption1">{failure}</p>}
    <div className={classNames(composerFrame, 'flex items-center')}>
      <LockIcon
        size={IconSize.Small}
        className="shrink-0 text-text-quaternary"
      />
      <input
        aria-label="Message"
        readOnly
        disabled
        placeholder={placeholder}
        className="min-h-8 min-w-0 flex-1 bg-transparent py-1.5 text-text-primary typo-callout placeholder:text-text-tertiary disabled:cursor-default"
      />
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={loading}
        onClick={onAction}
      >
        {action}
      </Button>
    </div>
    <span className="text-text-quaternary typo-caption2">
      Be kind. The same rules as comments apply, and moderators can remove
      anyone.
    </span>
  </div>
);
