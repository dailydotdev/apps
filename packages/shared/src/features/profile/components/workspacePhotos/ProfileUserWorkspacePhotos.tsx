import type { ReactElement } from 'react';
import React, { useState, useCallback } from 'react';
import type { PublicProfile } from '../../../../lib/user';
import {
  useUserWorkspacePhotos,
  MAX_WORKSPACE_PHOTOS,
} from '../../hooks/useUserWorkspacePhotos';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CameraIcon, PlusIcon } from '../../../../components/icons';
import { WorkspacePhotoItem } from './WorkspacePhotoItem';
import { WorkspacePhotoUploadModal } from './WorkspacePhotoUploadModal';
import type { AddUserWorkspacePhotoInput } from '../../../../graphql/user/userWorkspacePhoto';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { usePrompt } from '../../../../hooks/usePrompt';

interface ProfileUserWorkspacePhotosProps {
  user: PublicProfile;
}

export function ProfileUserWorkspacePhotos({
  user,
}: ProfileUserWorkspacePhotosProps): ReactElement | null {
  const { photos, isOwner, canAddMore, add, remove } =
    useUserWorkspacePhotos(user);
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleAdd = useCallback(
    async (input: AddUserWorkspacePhotoInput) => {
      try {
        await add(input);
        displayToast('Photo added');
      } catch (error) {
        displayToast('Failed to add photo');
        throw error;
      }
    },
    [add, displayToast],
  );

  const handleDelete = useCallback(
    async (photo: { id: string; image: string }) => {
      const confirmed = await showPrompt({
        title: 'Remove photo?',
        description: 'Are you sure you want to remove this workspace photo?',
        okButton: { title: 'Remove', variant: ButtonVariant.Primary },
      });
      if (!confirmed) {
        return;
      }

      try {
        await remove(photo.id);
        displayToast('Photo removed');
      } catch (error) {
        displayToast('Failed to remove photo');
      }
    },
    [remove, displayToast, showPrompt],
  );

  const handleOpenModal = useCallback(() => {
    if (!canAddMore) {
      displayToast(`Maximum of ${MAX_WORKSPACE_PHOTOS} photos allowed`);
      return;
    }
    setIsModalOpen(true);
  }, [canAddMore, displayToast]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handlePhotoClick = useCallback((photo: { image: string }) => {
    setSelectedPhoto(photo.image);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const hasPhotos = photos.length > 0;

  if (!hasPhotos && !isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          My Setup
        </Typography>
        {isOwner && canAddMore && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={handleOpenModal}
          >
            Add
          </Button>
        )}
      </div>

      {hasPhotos ? (
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          {photos.map((photo) => (
            <WorkspacePhotoItem
              key={photo.id}
              photo={photo}
              isOwner={isOwner}
              onDelete={handleDelete}
              onClick={handlePhotoClick}
            />
          ))}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-4 rounded-16 bg-surface-float p-6">
            <div className="flex size-14 items-center justify-center rounded-full bg-overlay-quaternary-cabbage">
              <CameraIcon className="text-2xl" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Primary}
                bold
              >
                Show off your workspace
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                Share photos of your desk, setup, or coding environment
              </Typography>
            </div>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Add your first photo
            </Button>
          </div>
        )
      )}

      {isModalOpen && (
        <WorkspacePhotoUploadModal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          onSubmit={handleAdd}
        />
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Workspace photo lightbox"
        >
          <button
            type="button"
            className="bg-overlay-primary-fixed absolute inset-0"
            onClick={handleCloseLightbox}
            aria-label="Close lightbox"
          />
          <img
            src={selectedPhoto}
            alt="Workspace"
            className="relative max-h-full max-w-full rounded-16 object-contain"
          />
        </div>
      )}
    </div>
  );
}
