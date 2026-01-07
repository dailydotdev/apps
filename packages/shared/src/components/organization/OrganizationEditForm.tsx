import React from 'react';
import classNames from 'classnames';
import type z from 'zod';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import type { recruiterOrganizationEditSchema } from '../../features/organizations/schema';
import type { Organization } from '../../features/organizations/types';
import { usePrompt } from '../../hooks/usePrompt';
import { locationToString } from '../../lib/utils';
import { useOrganizationEditForm } from '../../features/organizations/hooks/useOrganizationEditForm';
import { useLocationAutocomplete } from '../../features/organizations/hooks/useLocationAutocomplete';
import { OrganizationEditFields } from '../../features/organizations/components/OrganizationEditFields';

// Re-export constants for backward compatibility
export {
  companySizeOptions,
  companyStageOptions,
} from '../../features/organizations/constants';

export type OrganizationFormData = {
  name?: string;
  website?: string;
  description?: string;
  perks?: string[];
  founded?: number;
  externalLocationId?: string;
  category?: string;
  size?: number;
  stage?: number;
  links?: Array<{
    type: string;
    link: string;
    title?: string | null;
    socialType?: string | null;
  }>;
};

export type OrganizationEditFormProps = {
  organization?: Organization | null;
  onSubmit: (
    data: z.infer<typeof recruiterOrganizationEditSchema>,
    imageFile: File | null,
    shouldClearImage: boolean,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  header?: React.ReactNode;
  /**
   * When true, renders the Cancel/Save buttons in a sticky header alongside the header prop
   */
  stickyHeaderActions?: boolean;
};

export const OrganizationEditForm = ({
  organization,
  onSubmit,
  onCancel,
  isSubmitting = false,
  header,
  stickyHeaderActions = false,
}: OrganizationEditFormProps) => {
  const { showPrompt } = usePrompt();

  const {
    form,
    imageFile,
    shouldClearImage,
    handleImageChange,
    perks,
    handleAddPerks,
    handleRemovePerk,
    links,
    handleAddLink,
    handleRemoveLink,
    handleUpdateLink,
  } = useOrganizationEditForm({ organization });

  const {
    locationOptions,
    isLoadingLocations,
    handleLocationSearch,
    findLocationById,
  } = useLocationAutocomplete();

  const { handleSubmit, formState, setValue } = form;
  const { isDirty } = formState;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(
      data as z.infer<typeof recruiterOrganizationEditSchema>,
      imageFile,
      shouldClearImage,
    );
  });

  const handleCancel = async () => {
    if (isDirty || imageFile || shouldClearImage) {
      const confirmed = await showPrompt({
        title: 'Discard changes?',
        description:
          'You have unsaved changes. Are you sure you want to leave?',
        okButton: {
          title: 'Discard',
          variant: ButtonVariant.Primary,
        },
        cancelButton: {
          title: 'Keep editing',
        },
      });
      if (!confirmed) {
        return;
      }
    }
    onCancel();
  };

  const handleLocationSelect = (value: string) => {
    const selectedLocation = findLocationById(value);
    setValue('externalLocationId', selectedLocation?.id, {
      shouldDirty: true,
    });
  };

  const actionButtons = (
    <>
      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        loading={isSubmitting}
      >
        Save
      </Button>
    </>
  );

  return (
    <form
      onSubmit={handleFormSubmit}
      className={classNames('flex flex-col gap-6', {
        'p-6': stickyHeaderActions,
      })}
    >
      {stickyHeaderActions ? (
        <div className="sticky top-0 z-3 -mx-6 -mt-6 flex items-center justify-between rounded-t-16 border-b border-border-subtlest-tertiary bg-background-popover px-6 py-4">
          <div className="flex-1">{header}</div>
          <div className="flex items-center gap-3">{actionButtons}</div>
        </div>
      ) : (
        header
      )}

      <OrganizationEditFields
        form={form}
        organization={organization}
        shouldClearImage={shouldClearImage}
        onImageChange={handleImageChange}
        locationOptions={
          locationOptions?.map((loc) => ({
            label: locationToString(loc),
            value: loc.id,
          })) || []
        }
        isLoadingLocations={isLoadingLocations}
        onLocationSearch={handleLocationSearch}
        onLocationSelect={handleLocationSelect}
        perks={perks}
        onAddPerks={handleAddPerks}
        onRemovePerk={handleRemovePerk}
        links={links}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
        onUpdateLink={handleUpdateLink}
      />

      {/* Actions */}
      {!stickyHeaderActions && (
        <div className="flex items-center justify-end gap-4">
          {actionButtons}
        </div>
      )}
    </form>
  );
};
