import React from 'react';
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
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const Page = (): ReactElement => {
  const router = useRouter();
  const { organization, isFetching } = useOrganization(
    router.query.orgId as string,
  );

  if (isFetching) {
    return null;
  }

  return (
    <AccountPageContainer title="General" className={{ section: 'gap-6' }}>
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

      <div className="flex items-center gap-6">
        <Image
          className="size-24 rounded-full object-cover"
          src={organization.image}
          alt={`Avatar of ${organization.name}`}
          type={ImageType.Organization}
        />
        <Button variant={ButtonVariant.Secondary} disabled>
          Upload image
        </Button>
      </div>

      <Typography bold type={TypographyType.Body}>
        Organization name
      </Typography>

      <TextField
        label="Organization name"
        inputId="organization-name"
        value={organization.name}
      />

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
          disabled
          variant={ButtonVariant.Primary}
          color={ButtonColor.Ketchup}
          className="self-start"
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
