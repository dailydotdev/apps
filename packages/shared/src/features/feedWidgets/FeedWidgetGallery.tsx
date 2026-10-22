import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { IconSize } from '../../components/Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { Tooltip } from '../../components/tooltip/Tooltip';
import type { FeedWidget, FeedWidgetKind } from './types';
import { FeedWidgetIcon } from './registry';
import { availableFeedWidgets } from './components';
import { TipIcon } from '../../components/icons/Tip';
import { feedWidgetTipAccent } from '../../styles/custom';

/** The tips the reader removed, offered back. They are not a widget. */
const TipsRow = ({ onAdd }: { onAdd: () => void }): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3">
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-10 text-white"
      style={{ background: feedWidgetTipAccent('cabbage') }}
    >
      <TipIcon size={IconSize.Medium} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold text-text-primary typo-callout">
        daily.dev tips
      </span>
      <span className="text-text-tertiary typo-footnote">
        A helpful tip above the ad.
      </span>
    </span>
    <Button
      variant={ButtonVariant.Secondary}
      size={ButtonSize.Small}
      onClick={onAdd}
      aria-label="Add daily.dev tips"
    >
      Add
    </Button>
  </div>
);

/** The widgets a reader can add, one row each; kinds already on the rail say so. */
export const FeedWidgetGallery = ({
  widgets,
  canAdd,
  onAdd,
  onRestoreTips,
  onRequestClose,
}: {
  widgets: FeedWidget[];
  canAdd: boolean;
  onAdd: (kind: FeedWidgetKind) => void;
  /** Set while the reader has removed the tips and can bring them back. */
  onRestoreTips?: () => void;
  onRequestClose: () => void;
}): ReactElement => {
  const { user, squads } = useAuthContext();
  const { loadedSettings, optOutReadingStreak } = useSettingsContext();
  const availability = {
    isLoggedIn: !!user,
    hasSquads: !!squads?.length,
    isReadingStreakOn: !(loadedSettings && optOutReadingStreak),
  };
  const definitions = availableFeedWidgets(availability);
  const onRail = new Set(widgets.map(({ kind }) => kind));

  return (
    <Modal
      isOpen
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Header title="Add a widget" />
      <Modal.Body className="flex flex-col gap-2">
        {onRestoreTips && <TipsRow onAdd={onRestoreTips} />}
        {definitions.map((definition) => {
          const isAdded =
            onRail.has(definition.kind) && !definition.allowMultiple;
          const disabledReason = isAdded
            ? undefined
            : definition.disabledReason?.(availability);
          // Inactive rather than disabled, so the button still takes the
          // hover and focus its tooltip needs.
          const button = (
            <Button
              variant={
                isAdded ? ButtonVariant.Tertiary : ButtonVariant.Secondary
              }
              size={ButtonSize.Small}
              disabled={isAdded || !canAdd}
              inactive={!!disabledReason}
              onClick={() => !disabledReason && onAdd(definition.kind)}
            >
              {isAdded ? 'Added' : 'Add'}
            </Button>
          );

          return (
            <div
              key={definition.kind}
              className={classNames(
                'flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3',
                disabledReason && 'opacity-64',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-secondary">
                <FeedWidgetIcon kind={definition.kind} size={IconSize.Medium} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold text-text-primary typo-callout">
                  {definition.name}
                </span>
                <span className="text-text-tertiary typo-footnote">
                  {definition.description}
                </span>
              </span>
              {disabledReason ? (
                <Tooltip content={disabledReason}>{button}</Tooltip>
              ) : (
                button
              )}
            </div>
          );
        })}
      </Modal.Body>
    </Modal>
  );
};
