import React, { useCallback, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { TextField } from '../../fields/TextField';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';
import { Typography, TypographyType } from '../../typography/Typography';
import { Dropdown } from '../../fields/Dropdown';
import Textarea from '../../fields/Textarea';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { labels } from '../../../lib';
import {
  opportunityEditOrganizationSchema,
  SocialMediaType,
} from '../../../lib/schema/opportunity';
import {
  clearOrganizationImageMutationOptions,
  editOpportunityOrganizationMutationOptions,
} from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { applyZodErrorsToForm } from '../../../lib/form';
import { opportunityEditDiscardPrompt } from './common';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';

import { TagElement } from '../../feeds/FeedSettings/TagElement';
import { FeedbackIcon, PlusIcon, MiniCloseIcon } from '../../icons';
import { IconSize } from '../../Icon';
import ImageInput from '../../fields/ImageInput';
import type {
  OrganizationLink as OrgLink,
  OrganizationSocialLink,
} from '../../../features/organizations/types';
import { OrganizationLinkType } from '../../../features/organizations/types';

export type OpportunityEditOrganizationModalProps = {
  id: string;
};

type LinkItem = (OrgLink | OrganizationSocialLink) & {
  title?: string;
};

type LinksInputProps = {
  links: LinkItem[];
  onAdd: (link: LinkItem) => void;
  onRemove: (index: number) => void;
  error?: string;
};

const LinksInput = ({ links, onAdd, onRemove, error }: LinksInputProps) => {
  const [linkType, setLinkType] = useState<OrganizationLinkType>(
    OrganizationLinkType.Social,
  );
  const [socialType, setSocialType] = useState<SocialMediaType | ''>('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const linkTypeOptions = ['Social', 'Custom', 'Press'];
  const socialTypeOptions = [
    SocialMediaType.GitHub,
    SocialMediaType.X,
    SocialMediaType.LinkedIn,
    SocialMediaType.Facebook,
    SocialMediaType.Crunchbase,
  ];

  const handleAdd = () => {
    if (!url.trim()) {
      return;
    }

    let newLink: LinkItem;

    if (linkType === OrganizationLinkType.Social) {
      if (!socialType) {
        return;
      }
      newLink = {
        type: OrganizationLinkType.Social,
        link: url.trim(),
        socialType,
        title: title.trim() || undefined,
      };
    } else {
      if (!title.trim()) {
        return;
      }
      newLink = {
        type: linkType,
        link: url.trim(),
        title: title.trim(),
      };
    }

    onAdd(newLink);
    setTitle('');
    setUrl('');
    setSocialType('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Typography
              type={TypographyType.Caption1}
              className="mb-1 block text-text-tertiary"
            >
              Type
            </Typography>
            <Dropdown
              className={{ container: 'flex-1' }}
              selectedIndex={linkTypeOptions.indexOf(
                linkType.charAt(0).toUpperCase() + linkType.slice(1),
              )}
              options={linkTypeOptions}
              onChange={(value) => {
                const lowerValue = value.toLowerCase();
                if (lowerValue === 'custom') {
                  setLinkType(OrganizationLinkType.Custom);
                } else if (lowerValue === 'press') {
                  setLinkType(OrganizationLinkType.Press);
                } else {
                  setLinkType(OrganizationLinkType.Social);
                }
              }}
            />
          </div>
          {linkType === OrganizationLinkType.Social && (
            <div className="flex-1">
              <Typography
                type={TypographyType.Caption1}
                className="mb-1 block text-text-tertiary"
              >
                Social Platform
              </Typography>
              <Dropdown
                className={{ container: 'flex-1' }}
                selectedIndex={
                  socialType
                    ? socialTypeOptions.findIndex((opt) => opt === socialType)
                    : undefined
                }
                options={socialTypeOptions}
                onChange={(value: string) => {
                  setSocialType(value as SocialMediaType);
                }}
              />
            </div>
          )}
        </div>
        <TextField
          type="text"
          inputId="linkTitle"
          label={
            linkType === OrganizationLinkType.Social
              ? 'Title (optional)'
              : 'Title'
          }
          placeholder={
            linkType === OrganizationLinkType.Social
              ? 'Leave empty to use platform name'
              : 'e.g., Blog, Press Release'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fieldType="secondary"
        />
        <div className="flex gap-2">
          <TextField
            type="url"
            inputId="linkUrl"
            label="URL"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={{ container: 'flex-1' }}
            fieldType="secondary"
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleAdd}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <div
              key={`${link.type}-${link.link}`}
              className="flex items-center justify-between rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Typography type={TypographyType.Callout} bold>
                    {link.title ||
                      ('socialType' in link
                        ? link.socialType.charAt(0).toUpperCase() +
                          link.socialType.slice(1)
                        : 'Link')}
                  </Typography>
                  <span className="rounded-6 bg-surface-float px-2 py-0.5 text-text-tertiary typo-caption2">
                    {link.type}
                    {'socialType' in link && ` • ${link.socialType}`}
                  </span>
                </div>
                <Typography
                  type={TypographyType.Footnote}
                  className="text-text-tertiary"
                >
                  {link.link}
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => {
                  const linkIndex = links.findIndex(
                    (l) => l.link === link.link && l.type === link.type,
                  );
                  onRemove(linkIndex);
                }}
                className="hover:text-text-primary"
              >
                <MiniCloseIcon size={IconSize.Medium} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Typography
          type={TypographyType.Footnote}
          className="text-status-error"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

type PerkInputProps = {
  perks: string[];
  onAdd: (perks: string | string[]) => void;
  onRemove: (perk: string) => void;
};

const PerkInput = ({ perks, onAdd, onRemove }: PerkInputProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <TextField
        type="text"
        inputId="perkInput"
        label="Add perks"
        placeholder="e.g., Remote work, Health insurance"
        hint="Add commas (,) to add multiple perks. Press Enter to submit them."
        hintIcon={<FeedbackIcon />}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();

            const newPerks = inputValue
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
              .filter((p) => !perks.includes(p)); // exclude already-added perks

            if (newPerks.length === 0) {
              if (inputValue) {
                setInputValue('');
              }
              return;
            }

            // Pass all new perks at once
            onAdd(newPerks);
            setInputValue('');
          }
        }}
        fieldType="secondary"
      />

      {perks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {perks.map((perk) => (
            <TagElement
              key={perk}
              tag={{ name: perk }}
              isSelected
              onClick={() => onRemove(perk)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OpportunityEditOrganizationModal = ({
  id,
  ...rest
}: OpportunityEditOrganizationModalProps & ModalProps) => {
  const [organizationImageFile, setOrganizationImageFile] =
    useState<File | null>(null);
  const [shouldClearImage, setShouldClearImage] = useState(false);
  const { displayToast } = useToastNotification();
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(opportunityByIdOptions({ id }));

  const { mutateAsync } = useMutation({
    ...editOpportunityOrganizationMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);

      rest.onRequestClose?.(null);
    },
  });

  const { mutateAsync: clearImageMutation } = useMutation({
    ...clearOrganizationImageMutationOptions(),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(opportunityEditOrganizationSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      // Merge all link types into a single array
      const customLinks = opportunityData.organization.customLinks || [];
      const socialLinks = opportunityData.organization.socialLinks || [];
      const pressLinks = opportunityData.organization.pressLinks || [];
      const allLinks = [...customLinks, ...socialLinks, ...pressLinks];

      return {
        organization: {
          website: opportunityData.organization.website || '',
          description: opportunityData.organization.description || '',
          perks: opportunityData.organization.perks || [],
          founded: opportunityData.organization.founded || undefined,
          location: opportunityData.organization.location || '',
          category: opportunityData.organization.category || '',
          size: opportunityData.organization.size || undefined,
          stage: opportunityData.organization.stage || undefined,
          links: allLinks,
        },
      };
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Clear image first if requested
      if (shouldClearImage) {
        await clearImageMutation({ id });
      }

      await mutateAsync({
        id,
        payload: data as z.infer<typeof opportunityEditOrganizationSchema>,
        organizationImage: organizationImageFile || undefined,
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

  if (!opportunity) {
    return <Loader />;
  }

  const perks = watch('organization.perks') || [];
  const links = watch('organization.links') || [];

  const companySizeOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1,000',
    '1,001-5,000',
    '5,000+',
  ];

  const companyStageOptions = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Series D',
    'Public',
    'Bootstrapped',
    'Non-profit',
    'Government',
  ];

  return (
    <Modal {...rest} isOpen onRequestClose={onRequestClose}>
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
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Company image
          </Typography>
          <ImageInput
            initialValue={
              shouldClearImage ? null : opportunity?.organization?.image
            }
            id="organizationImage"
            size="large"
            onChange={(_base64, file) => {
              if (file === null) {
                // User clicked the close button
                setShouldClearImage(true);
                setOrganizationImageFile(null);
              } else {
                // User uploaded a new image
                setShouldClearImage(false);
                setOrganizationImageFile(file);
              }
              setValue('organization', watch('organization'), {
                shouldDirty: true,
              });
            }}
            closeable
            fileSizeLimitMB={5}
          />
        </div>
        <TextField
          {...register('organization.website')}
          type="url"
          inputId="organizationWebsite"
          label="Company website"
          fieldType="secondary"
          valid={!errors.organization?.website}
          hint={errors.organization?.website?.message}
        />
        <Textarea
          {...register('organization.description')}
          inputId="organizationDescription"
          label="Company description"
          fieldType="secondary"
          maxLength={2000}
          valid={!errors.organization?.description}
          hint={errors.organization?.description?.message}
        />
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Company links
          </Typography>
          <LinksInput
            links={links}
            onAdd={(link) => {
              setValue('organization.links', [...links, link], {
                shouldDirty: true,
              });
            }}
            onRemove={(index) => {
              setValue(
                'organization.links',
                links.filter((_link: LinkItem, i: number) => i !== index),
                { shouldDirty: true },
              );
            }}
            error={errors.organization?.links?.message}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Company perks
          </Typography>
          <PerkInput
            perks={perks}
            onAdd={(perk) => {
              const newPerks = Array.isArray(perk) ? perk : [perk];
              setValue('organization.perks', [...perks, ...newPerks], {
                shouldDirty: true,
              });
            }}
            onRemove={(perk) => {
              setValue(
                'organization.perks',
                perks.filter((p: string) => p !== perk),
                { shouldDirty: true },
              );
            }}
          />
        </div>
        <TextField
          {...register('organization.location')}
          type="text"
          inputId="organizationLocation"
          label="Company location"
          fieldType="secondary"
          valid={!errors.organization?.location}
          hint={errors.organization?.location?.message}
        />
        <TextField
          {...register('organization.category')}
          type="text"
          inputId="organizationCategory"
          label="Company category"
          fieldType="secondary"
          valid={!errors.organization?.category}
          hint={errors.organization?.category?.message}
        />
        <TextField
          {...register('organization.founded', {
            valueAsNumber: true,
          })}
          className={{
            container: 'max-w-32',
          }}
          type="number"
          inputId="organizationFounded"
          label="Founded year"
          fieldType="secondary"
          valid={!errors.organization?.founded}
          hint={errors.organization?.founded?.message}
        />
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Company size
          </Typography>
          <Controller
            name="organization.size"
            control={control}
            render={({ field }) => {
              return (
                <Dropdown
                  className={{
                    container: 'flex-1',
                  }}
                  selectedIndex={field.value ? field.value - 1 : undefined}
                  options={companySizeOptions}
                  onChange={(value) => {
                    const valueIndex = companySizeOptions.indexOf(value);
                    field.onChange(valueIndex + 1);
                  }}
                  valid={!errors.organization?.size}
                  hint={errors.organization?.size?.message as string}
                />
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Company stage
          </Typography>
          <Controller
            name="organization.stage"
            control={control}
            render={({ field }) => {
              return (
                <Dropdown
                  className={{
                    container: 'flex-1',
                  }}
                  selectedIndex={field.value ? field.value - 1 : undefined}
                  options={companyStageOptions}
                  onChange={(value) => {
                    const valueIndex = companyStageOptions.indexOf(value);
                    field.onChange(valueIndex + 1);
                  }}
                  valid={!errors.organization?.stage}
                  hint={errors.organization?.stage?.message as string}
                />
              );
            }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};
