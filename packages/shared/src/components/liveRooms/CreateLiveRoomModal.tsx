import type { ReactElement } from 'react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import ControlledTextField from '../fields/ControlledTextField';
import { type LiveRoomJoinToken, LiveRoomMode } from '../../graphql/liveRooms';
import { useCreateLiveRoom } from '../../hooks/liveRooms/useCreateLiveRoom';
import { useToastNotification } from '../../hooks/useToastNotification';
import { labels } from '../../lib/labels';

const createLiveRoomFormSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, 'Topic is required')
    .max(280, 'Topic must be 280 characters or less'),
});

type CreateLiveRoomFormValues = z.infer<typeof createLiveRoomFormSchema>;

const CREATE_LIVE_ROOM_FORM_ID = 'create-live-room-form';

interface CreateLiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (joinToken: LiveRoomJoinToken) => void;
}

export const CreateLiveRoomModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateLiveRoomModalProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const { mutateAsync: createLiveRoom, isPending } = useCreateLiveRoom();

  const form = useForm<CreateLiveRoomFormValues>({
    resolver: zodResolver(createLiveRoomFormSchema),
    defaultValues: { topic: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const joinToken = await createLiveRoom({
        topic: values.topic,
        mode: LiveRoomMode.Debate,
      });
      onCreated(joinToken);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : labels.error.generic;
      displayToast(message);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onClose}
    >
      <Modal.Header title="Start a live room" />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Pick a topic and we&apos;ll spin up a debate room you can host right
          away.
        </Typography>
        <FormProvider {...form}>
          <form
            id={CREATE_LIVE_ROOM_FORM_ID}
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <ControlledTextField
              name="topic"
              label="Topic"
              placeholder="What do you want to debate?"
            />
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          form={CREATE_LIVE_ROOM_FORM_ID}
          type="submit"
          variant={ButtonVariant.Primary}
          loading={isPending}
        >
          Start room
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateLiveRoomModal;
