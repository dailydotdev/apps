import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';

import { useRouter } from 'next/router';

import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { formToJson } from '@dailydotdev/shared/src/lib/form';
import ImageInput from '@dailydotdev/shared/src/components/fields/ImageInput';
import { cloudinaryOrganizationImageFallback } from '@dailydotdev/shared/src/lib/image';
import { CameraIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type {
  UpdateOrganizationForm,
  UpdateOrganizationInput,
} from '@dailydotdev/shared/src/features/organizations/types';
import { SubscriptionStatus } from '@dailydotdev/shared/src/lib/plus';

import type { PromptOptions } from '@dailydotdev/shared/src/hooks/usePrompt';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { defaultSeo } from '../../../../next-seo';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';

const Page = (): ReactElement => {
  const router = useRouter();
  const { showPrompt } = usePrompt();
  const {
    organization,
    isFetching,
    updateOrganization,
    isUpdatingOrganization,
    seats,
    isOwner,
    deleteOrganization,
    isDeletingOrganization,
  } = useOrganization(router.query.orgId as string);

  const [imageChanged, setImageChanged] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formJson = formToJson<UpdateOrganizationForm>(e.currentTarget);

    if (!formJson?.name) {
      return null;
    }

    const data: UpdateOrganizationInput = {
      name: formJson.name,
    };

    if (imageChanged && formJson.image) {
      const [imageFile] = formJson.image;
      data.image = imageFile;
    }

    await updateOrganization({
      id: organization.id,
      form: data,
    });

    setImageChanged(false);
    return null;
  };

  const onDeleteOrganization = async () => {
    const options: PromptOptions = {
      title: 'Delete organization',
      description: 'Are you sure you want to delete this organization?',
      okButton: {
        title: 'Delete',
        className: 'btn-primary-ketchup',
      },
    };
    if (await showPrompt(options)) {
      try {
        await deleteOrganization();
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  const disableDeletion =
    !isOwner ||
    organization.status === SubscriptionStatus.Active ||
    seats.assigned > 0;

  if (isFetching) {
    return null;
  }

  return (
    <AccountPageContainer
      title="General"
      className={{ section: 'gap-6' }}
      actions={
        <>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            form="organization"
            loading={isUpdatingOrganization}
          >
            Save changes
          </Button>
        </>
      }
    >
      <form
        id="organization"
        className="flex flex-col gap-6"
        method="post"
        onSubmit={handleSubmit}
      >
        <div>
          <Typography bold type={TypographyType.Body}>
            Organization logo
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Upload your logo so your team can easily recognize your workspace.
            This will only be visible to members in your organization.
          </Typography>
        </div>

        <ImageInput
          initialValue={organization.image}
          id="image"
          name="image"
          fallbackImage={cloudinaryOrganizationImageFallback}
          className={{
            root: 'flex items-center gap-6',
            container: '!rounded-full border-0',
            img: 'object-cover',
          }}
          hoverIcon={<CameraIcon size={IconSize.Large} />}
          alwaysShowHover={!organization.image && !imageChanged}
          onChange={() => setImageChanged(true)}
          size="medium"
          uploadButton
        />

        <Typography bold type={TypographyType.Body}>
          Organization name
        </Typography>

        <TextField
          label="Organization name"
          inputId="name"
          value={organization.name}
          name="name"
        />
      </form>

      <div className="flex flex-col gap-4">
        <Typography bold type={TypographyType.Body}>
          🚨 Danger zone
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          To delete your organization, you&apos;ll first need to:
          <br />
          <br />
          <li className="list-disc pl-4">Unassign all seats</li>
          <li className="list-disc pl-4">Cancel your active subscription</li>
          <br />
          Once those steps are complete, you&apos;ll be able to delete the
          organization permanently.
          <br />
          <br />
          Important: deleting your organization is unrecoverable and cannot be
          undone. Feel free to contact{' '}
          <a
            className="text-text-link"
            href="mailto:support@daily.dev?subject=I have a question about deleting my organization"
            target="_blank"
            rel={anchorDefaultRel}
          >
            support@daily.dev
          </a>{' '}
          with any questions.
        </Typography>

        <Button
          disabled={disableDeletion}
          loading={isDeletingOrganization}
          variant={ButtonVariant.Primary}
          color={ButtonColor.Ketchup}
          className="self-start"
          onClick={onDeleteOrganization}
        >
          Delete organization
        </Button>
      </div>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Organization'),
};

Page.getLayout = getOrganizationLayout;
Page.layoutProps = { seo };

export default Page;
