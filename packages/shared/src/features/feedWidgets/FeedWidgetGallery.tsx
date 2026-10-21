import type { ReactElement } from 'react';
import React from 'react';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { Button } from '../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { IconSize } from '../../components/Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import type { FeedWidget, FeedWidgetKind } from './types';
import { FeedWidgetIcon } from './registry';
import { availableFeedWidgets } from './components';

/** The widgets a reader can add, one row each; kinds already on the rail say so. */
export const FeedWidgetGallery = ({
  widgets,
  canAdd,
  onAdd,
  onRequestClose,
}: {
  widgets: FeedWidget[];
  canAdd: boolean;
  onAdd: (kind: FeedWidgetKind) => void;
  onRequestClose: () => void;
}): ReactElement => {
  const { user, squads } = useAuthContext();
  const definitions = availableFeedWidgets({
    isLoggedIn: !!user,
    hasSquads: !!squads?.length,
  });
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
        {definitions.map((definition) => {
          const isAdded =
            onRail.has(definition.kind) && !definition.allowMultiple;

          return (
            <div
              key={definition.kind}
              className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3"
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
              <Button
                variant={
                  isAdded ? ButtonVariant.Tertiary : ButtonVariant.Secondary
                }
                size={ButtonSize.Small}
                disabled={isAdded || !canAdd}
                onClick={() => onAdd(definition.kind)}
              >
                {isAdded ? 'Added' : 'Add'}
              </Button>
            </div>
          );
        })}
      </Modal.Body>
    </Modal>
  );
};
