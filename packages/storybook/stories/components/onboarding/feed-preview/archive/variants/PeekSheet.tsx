import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../../previewData';
import { SourceStack } from '../../PreviewKit';
import { PreviewList } from '../../PreviewKit';

const SHEET_LIST_SIZE = 6;

export const PeekSheet = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags, posts, isReady, remaining, isRefreshing, freshIds } =
    usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <TagStepFrame
      onContinue={onContinue}
      docked={
        <div className="flex justify-center">
          <Button
            className="!pl-2"
            disabled={!isReady}
            icon={isReady ? <SourceStack posts={posts} /> : <EyeIcon />}
            onClick={() => setIsOpen(true)}
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
          >
            {isReady ? 'Preview your feed' : getPickMoreCopy(remaining)}
          </Button>
        </div>
      }
    >
      {isOpen && (
        <Modal
          isDrawerOnMobile
          isOpen
          kind={ModalKind.FlexibleCenter}
          onRequestClose={() => setIsOpen(false)}
          size={ModalSize.Small}
        >
          <Modal.Header title="Your feed preview" />
          <Modal.Body className="!pb-0 !pt-0">
            <p className="text-text-tertiary typo-footnote">
              Top posts this week from {tags.length} tags you picked.
            </p>
            <PreviewList
              freshIds={freshIds}
              isRefreshing={isRefreshing}
              posts={posts}
              size={SHEET_LIST_SIZE}
            />
            {/* In the body, not Modal.Footer: the sheet on phones drops footers. */}
            <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-border-subtlest-tertiary bg-background-default px-6 py-3">
              <Button
                onClick={() => setIsOpen(false)}
                variant={ButtonVariant.Float}
              >
                Edit tags
              </Button>
              <Button
                className="flex-1"
                onClick={onContinue}
                variant={ButtonVariant.Primary}
              >
                Looks good, continue
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </TagStepFrame>
  );
};
