import React, { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type z from 'zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { labels } from '../../../lib';
import type { recruiterOrganizationEditSchema } from '../../../features/organizations/schema';
import {
  clearRecruiterOrganizationImageMutationOptions,
  updateRecruiterOrganizationMutationOptions,
} from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { applyZodErrorsToForm } from '../../../lib/form';
import { opportunityEditDiscardPrompt } from './common';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';
import { ModalSize } from '../../modals/common/types';
import { locationToString } from '../../../lib/utils';
import { RequestKey } from '../../../lib/query';
import { useOrganizationEditForm } from '../../../features/organizations/hooks/useOrganizationEditForm';
import { useLocationAutocomplete } from '../../../features/organizations/hooks/useLocationAutocomplete';
import { OrganizationEditFields } from '../../../features/organizations/components/OrganizationEditFields';

export type OpportunityEditOrganizationModalProps = {
  id: string;
};

export const OpportunityEditOrganizationModal = ({
  id,
  ...rest
}: OpportunityEditOrganizationModalProps & ModalProps) => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();

  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [get, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id }),
  );

  // Use the shared form hook with async default values
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
  } = useOrganizationEditForm({
    defaultValuesPromise: promise.then((opportunityData) => {
      const customLinks = opportunityData.organization?.customLinks || [];
      const socialLinks = opportunityData.organization?.socialLinks || [];
      const pressLinks = opportunityData.organization?.pressLinks || [];
      const allLinks = [...customLinks, ...socialLinks, ...pressLinks];

      return {
        name: opportunityData.organization?.name || '',
        website: opportunityData.organization?.website || '',
        description: opportunityData.organization?.description || '',
        perks: opportunityData.organization?.perks || [],
        founded: opportunityData.organization?.founded || undefined,
        externalLocationId:
          opportunityData.organization?.externalLocationId || undefined,
        category: opportunityData.organization?.category || '',
        size: opportunityData.organization?.size || undefined,
        stage: opportunityData.organization?.stage || undefined,
        links: allLinks,
      };
    }),
  });

  const {
    locationOptions,
    isLoadingLocations,
    handleLocationSearch,
    findLocationById,
  } = useLocationAutocomplete();

  const { handleSubmit, formState, setError, setValue } = form;
  const { isSubmitting, isDirty } = formState;

  const { mutateAsync: updateOrgMutation } = useMutation({
    ...updateRecruiterOrganizationMutationOptions(),
    onSuccess: (result) => {
      const currentOpportunity = get();
      updateOpportunity({
        ...currentOpportunity,
        organization: {
          ...currentOpportunity.organization,
          ...result,
        },
      });

      // Invalidate opportunities query to update sidebar
      queryClient.invalidateQueries({
        queryKey: [RequestKey.Opportunities],
      });

      rest.onRequestClose?.(null);
    },
  });

  const { mutateAsync: clearImageMutation } = useMutation({
    ...clearRecruiterOrganizationImageMutationOptions(),
  });

  const onSubmit = handleSubmit(async (data) => {
    const organizationId = opportunity?.organization?.id;

    if (!organizationId) {
      displayToast('Organization not found. Please refresh the page.');
      return;
    }

    try {
      // Clear image first if requested
      if (shouldClearImage) {
        await clearImageMutation({ id: organizationId });
      }

      await updateOrgMutation({
        id: organizationId,
        payload: data as z.infer<typeof recruiterOrganizationEditSchema>,
        organizationImage: imageFile || undefined,
      });
    } catch (originalError) {
      if (
        originalError.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        applyZodErrorsToForm({
          error: originalError,
          setError,
        });
      } else {
        displayToast(
          originalError.response?.errors?.[0]?.message || labels.error.generic,
        );
      }

      throw originalError;
    }
  });

  const onValidateAction = useCallback(() => {
    return !isDirty;
  }, [isDirty]);

  const { showPrompt } = usePrompt();

  useExitConfirmation({
    message: labels.form.discard.description,
    onValidateAction,
  });

  const onRequestClose: ModalProps['onRequestClose'] = async (event) => {
    const shouldPrompt = !onValidateAction();

    if (shouldPrompt) {
      const shouldSave = await showPrompt(opportunityEditDiscardPrompt);

      if (shouldSave) {
        await onSubmit();
        return;
      }
    }

    rest.onRequestClose?.(event);
  };

  const handleLocationSelect = (value: string) => {
    const selectedLocation = findLocationById(value);
    setValue('externalLocationId', selectedLocation?.id, {
      shouldDirty: true,
    });
  };

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <Modal
      {...rest}
      isOpen
      onRequestClose={onRequestClose}
      size={ModalSize.Large}
    >
      <Modal.Header className="flex justify-between" showCloseButton={false}>
        <Modal.Title className="typo-title3">Company information</Modal.Title>
        <div className="flex items-center gap-4">
          <Button
            type="text"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={onRequestClose}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onSubmit}
            loading={isSubmitting}
          >
            Save
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="gap-6 p-4">
        <OrganizationEditFields
          form={form}
          organization={opportunity.organization}
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
      </Modal.Body>
    </Modal>
  );
};
