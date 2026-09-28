import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Switch } from '../../../../components/fields/Switch';
import { EyeIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { useSquadPageContext } from '../../SquadPageContext';
import { SquadViewer } from '../../lib/viewer';

export const SquadPreviewToggle = (): ReactElement | null => {
  const { canPreview, isPreviewing, togglePreview } = useSquadPageContext();

  if (!canPreview) {
    return null;
  }

  return (
    <div className="hidden items-center gap-3 rounded-16 border border-border-subtlest-tertiary px-4 py-3 laptop:flex">
      <EyeIcon
        size={IconSize.Small}
        secondary={isPreviewing}
        className={classNames(
          'shrink-0',
          isPreviewing ? 'text-text-primary' : 'text-text-tertiary',
        )}
      />
      <span className="min-w-0 flex-1 font-bold text-text-primary typo-callout">
        View as a visitor
      </span>
      <Switch
        inputId="squad-preview-toggle"
        name="squadPreview"
        checked={isPreviewing}
        onToggle={togglePreview}
        className="shrink-0"
        aria-label="View as a visitor"
      />
    </div>
  );
};

export const SquadPreviewNotice = (): ReactElement | null => {
  const { isPreviewing, ownViewer, togglePreview } = useSquadPageContext();

  if (!isPreviewing) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-surface-float px-4 py-2.5 laptop:mb-3 laptop:rounded-16">
      <EyeIcon
        size={IconSize.Small}
        secondary
        className="shrink-0 text-text-tertiary"
      />
      <span className="min-w-0 flex-1 text-text-secondary typo-footnote">
        <strong className="text-text-primary">
          You&apos;re viewing the page as a visitor.
        </strong>{' '}
        Team tools are hidden.
      </span>
      <Button
        variant={ButtonVariant.Subtle}
        size={ButtonSize.XSmall}
        onClick={togglePreview}
      >
        {ownViewer === SquadViewer.Admin
          ? 'Back to admin view'
          : 'Back to your view'}
      </Button>
    </div>
  );
};
