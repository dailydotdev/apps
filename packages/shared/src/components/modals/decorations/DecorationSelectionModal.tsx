import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonVariant } from '../../buttons/Button';
import { ProfilePictureWithDecoration } from '../../profile/ProfilePictureWithDecoration';
import { ProfileImageSize } from '../../ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  DECORATIONS_BY_GROUP_QUERY,
  SET_ACTIVE_DECORATION_MUTATION,
} from '../../../graphql/decorations';
import type { Decoration, DecorationGroup } from '../../../graphql/decorations';
import { gqlClient } from '../../../graphql/common';
import { LockIcon, VIcon } from '../../icons';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Loader } from '../../Loader';

interface DecorationItemProps {
  decoration: Decoration;
  isSelected: boolean;
  onSelect: (decoration: Decoration) => void;
}

const DecorationItem = ({
  decoration,
  isSelected,
  onSelect,
}: DecorationItemProps): ReactElement => {
  const isLocked = !decoration.isUnlocked;

  return (
    <button
      type="button"
      className={classNames(
        'relative flex flex-col items-center gap-2 rounded-12 border p-3 transition-colors',
        isSelected
          ? 'border-accent-cabbage-default bg-surface-float'
          : 'border-border-subtlest-tertiary hover:border-border-subtlest-secondary',
        isLocked && 'opacity-60',
      )}
      onClick={() => onSelect(decoration)}
    >
      <div className="relative">
        <img
          src={decoration.media}
          alt={decoration.name}
          className="size-16 object-contain"
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-overlay-tertiary-pepper">
            <LockIcon className="text-text-secondary" />
          </div>
        )}
        {isSelected && (
          <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent-cabbage-default">
            <VIcon className="size-3 text-white" />
          </div>
        )}
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={isLocked ? TypographyColor.Quaternary : TypographyColor.Primary}
        className="text-center"
      >
        {decoration.name}
      </Typography>
      {isLocked && decoration.unlockCriteria && (
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          {decoration.unlockCriteria}
        </Typography>
      )}
    </button>
  );
};

export default function DecorationSelectionModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { user, updateUser } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [selectedDecoration, setSelectedDecoration] =
    useState<Decoration | null>(
      user?.activeDecoration ? (user.activeDecoration as Decoration) : null,
    );

  const { data, isLoading } = useQuery({
    queryKey: ['decorationsByGroup'],
    queryFn: async () => {
      const result = await gqlClient.request<{
        decorationsByGroup: DecorationGroup[];
      }>(DECORATIONS_BY_GROUP_QUERY);
      return result.decorationsByGroup;
    },
  });

  const { mutate: setActiveDecoration, isPending } = useMutation({
    mutationFn: async (decorationId: string | null) => {
      const result = await gqlClient.request<{
        setActiveDecoration: {
          id: string;
          activeDecoration: Decoration | null;
        };
      }>(SET_ACTIVE_DECORATION_MUTATION, { decorationId });
      return result.setActiveDecoration;
    },
    onSuccess: (response) => {
      updateUser({
        ...user,
        activeDecoration: response.activeDecoration,
      });
      displayToast('Avatar decoration updated');
      onRequestClose?.(null);
    },
    onError: () => {
      displayToast('Failed to update decoration');
    },
  });

  const handleApply = () => {
    setActiveDecoration(selectedDecoration?.id ?? null);
  };

  const handleClearDecoration = () => {
    setSelectedDecoration(null);
  };

  const hasChanged =
    (selectedDecoration?.id ?? null) !== (user?.activeDecoration?.id ?? null);
  const isSelectedLocked = selectedDecoration && !selectedDecoration.isUnlocked;

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      {...props}
    >
      <Modal.Header title="Avatar Decoration" />
      <Modal.Body className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 overflow-visible p-4">
          <ProfilePictureWithDecoration
            user={user}
            size={ProfileImageSize.XXXXLarge}
            decoration={selectedDecoration}
          />
          {selectedDecoration && (
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={handleClearDecoration}
            >
              Remove decoration
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader />
          </div>
        ) : (
          data?.map((group) => (
            <div key={group.group} className="flex flex-col gap-3">
              <Typography type={TypographyType.Body} bold>
                {group.label}
              </Typography>
              <div className="grid grid-cols-3 gap-3 tablet:grid-cols-4">
                {group.decorations.map((decoration) => (
                  <DecorationItem
                    key={decoration.id}
                    decoration={decoration}
                    isSelected={selectedDecoration?.id === decoration.id}
                    onSelect={setSelectedDecoration}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant={ButtonVariant.Tertiary} onClick={onRequestClose}>
          Cancel
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          onClick={handleApply}
          disabled={!hasChanged || isPending || isSelectedLocked}
          loading={isPending}
        >
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
