import type { type ReactElement } from 'react';
import React from 'react';
import { Modal } from '../common/Modal';
import type { type ModalProps } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { Button, ButtonVariant } from '../../buttons/Button';
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
      onUndo: () => onUndo(feed?.id),
    });
    onAdd?.(feed?.id);
    closeModal();
  };

  return (
    <Modal {...props}>
      <ModalHeader title="Add to custom feed" />
      <Modal.Body>
        <Button
          onClick={onCreateNewFeed}
          icon={
            <div className="flex  rounded-6 bg-background-subtle">
              <PlusIcon className="m-auto" />
            </div>
          }
          variant={ButtonVariant.Option}
        >
          Custom feed
        </Button>
        {feeds?.edges?.length > 0 &&
          feeds.edges.map((feed) => (
            <Button
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
            </Button>
          ))}
      </Modal.Body>
    </Modal>
  );
};

export default AddToCustomFeedModal;
