import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { ButtonV2, ButtonVariant } from '../../buttons/ButtonV2';
import { PlusIcon, HashtagIcon } from '../../icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { useFeeds, useToastNotification } from '../../../hooks';
import type { Feed } from '../../../graphql/feed';

type AddToFeedModalProps = Omit<ModalProps, 'children'> & {
  onAdd: (feedId: string) => void;
  onUndo?: (feedId: string) => void;
  onCreateNewFeed?: () => void;
};

const AddToCustomFeedModal = ({
  onAdd,
  onUndo,
  onCreateNewFeed,
  ...props
}: AddToFeedModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { closeModal } = useLazyModal();
  const { feeds } = useFeeds();
  const isMoving = false;
  const isPending = false;

  const handleAddToCustomFeed = async (feed: Feed) => {
    if (isMoving) {
      return;
    }
    displayToast(`✅ Added to ${feed?.flags?.name}`, {
      action: {
        copy: 'Undo',
        onClick: () => onUndo(feed?.id),
      },
    });
    onAdd?.(feed?.id);
    closeModal();
  };

  return (
    <Modal {...props}>
      <ModalHeader title="Add to custom feed" />
      <Modal.Body>
        <ButtonV2
          onClick={onCreateNewFeed}
          icon={
            <div className="flex  rounded-6 bg-background-subtle">
              <PlusIcon className="m-auto" />
            </div>
          }
          variant={ButtonVariant.Option}
        >
          Custom feed
        </ButtonV2>
        {feeds?.edges?.length > 0 &&
          feeds.edges.map((feed) => (
            <ButtonV2
              loading={isPending}
              key={feed.node.id}
              onClick={() => handleAddToCustomFeed(feed.node)}
              variant={ButtonVariant.Option}
              icon={
                feed.node?.flags?.icon ? (
                  <span>{feed.node?.flags?.icon}</span>
                ) : (
                  <HashtagIcon />
                )
              }
              role="radio"
            >
              {feed.node?.flags.name}
            </ButtonV2>
          ))}
      </Modal.Body>
    </Modal>
  );
};

export default AddToCustomFeedModal;
