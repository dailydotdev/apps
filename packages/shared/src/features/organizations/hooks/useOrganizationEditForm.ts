import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { recruiterOrganizationEditSchema } from '../schema';
import type { Organization } from '../types';
import type { LinkItem } from '../utils/platformDetection';

export type OrganizationFormValues = z.infer<
  typeof recruiterOrganizationEditSchema
>;

export type UseOrganizationEditFormOptions = {
  organization?: Organization | null;
  defaultValuesPromise?: Promise<OrganizationFormValues>;
};

export type UseOrganizationEditFormReturn = {
  // Form methods from react-hook-form
  form: ReturnType<typeof useForm<OrganizationFormValues>>;
  // Image handling
  imageFile: File | null;
  shouldClearImage: boolean;
  handleImageChange: (base64: string | null, file: File | null) => void;
  // Perks helpers
  perks: string[];
  handleAddPerks: (perk: string | string[]) => void;
  handleRemovePerk: (perk: string) => void;
  // Links helpers
  links: LinkItem[];
  handleAddLink: (link: LinkItem) => void;
  handleRemoveLink: (index: number) => void;
  handleUpdateLink: (index: number, link: LinkItem) => void;
};

/**
 * Merges all link types from an organization into a single array
 */
const mergeOrganizationLinks = (
  organization?: Organization | null,
): LinkItem[] => {
  if (!organization) {
    return [];
  }
  const customLinks = organization.customLinks || [];
  const socialLinks = organization.socialLinks || [];
  const pressLinks = organization.pressLinks || [];
  return [...customLinks, ...socialLinks, ...pressLinks] as LinkItem[];
};

/**
 * Creates default form values from an organization
 */
const createDefaultValues = (
  organization?: Organization | null,
): OrganizationFormValues => {
  return {
    name: organization?.name || '',
    website: organization?.website || '',
    description: organization?.description || '',
    perks: organization?.perks || [],
    founded: organization?.founded || undefined,
    externalLocationId: organization?.externalLocationId || undefined,
    category: organization?.category || '',
    size: organization?.size || undefined,
    stage: organization?.stage || undefined,
    links: mergeOrganizationLinks(organization),
  };
};

export const useOrganizationEditForm = (
  options: UseOrganizationEditFormOptions = {},
): UseOrganizationEditFormReturn => {
  const { organization, defaultValuesPromise } = options;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shouldClearImage, setShouldClearImage] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(recruiterOrganizationEditSchema),
    defaultValues: defaultValuesPromise
      ? async () => {
          const values = await defaultValuesPromise;
          return values;
        }
      : createDefaultValues(organization),
  });

  const { setValue, watch } = form;

  // Watch perks and links for helpers
  const perks = watch('perks') || [];
  const links = (watch('links') || []) as LinkItem[];

  // Image handling
  const handleImageChange = useCallback(
    (_base64: string | null, file: File | null) => {
      if (file === null) {
        // User clicked the close button
        setShouldClearImage(true);
        setImageFile(null);
      } else {
        // User uploaded a new image
        setShouldClearImage(false);
        setImageFile(file);
      }
      // Trigger form dirty state
      setValue('name', watch('name'), { shouldDirty: true });
    },
    [setValue, watch],
  );

  // Perks helpers
  const handleAddPerks = useCallback(
    (perk: string | string[]) => {
      const newPerks = Array.isArray(perk) ? perk : [perk];
      setValue('perks', [...perks, ...newPerks], { shouldDirty: true });
    },
    [perks, setValue],
  );

  const handleRemovePerk = useCallback(
    (perk: string) => {
      setValue(
        'perks',
        perks.filter((p: string) => p !== perk),
        { shouldDirty: true },
      );
    },
    [perks, setValue],
  );

  // Links helpers
  const handleAddLink = useCallback(
    (link: LinkItem) => {
      setValue('links', [...links, link] as OrganizationFormValues['links'], {
        shouldDirty: true,
      });
    },
    [links, setValue],
  );

  const handleRemoveLink = useCallback(
    (index: number) => {
      setValue(
        'links',
        links.filter((_, i: number) => i !== index),
        { shouldDirty: true },
      );
    },
    [links, setValue],
  );

  const handleUpdateLink = useCallback(
    (index: number, updatedLink: LinkItem) => {
      const newLinks = [...links];
      newLinks[index] = updatedLink;
      setValue('links', newLinks as OrganizationFormValues['links'], {
        shouldDirty: true,
      });
    },
    [links, setValue],
  );

  return {
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
  };
};
