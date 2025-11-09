import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';

import {
  Divider,
  FlexCol,
  FlexRow,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import classed from '@dailydotdev/shared/src/lib/classed';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import { CandidatePreferenceButton } from '@dailydotdev/shared/src/features/opportunity/components/CandidatePreferenceButton';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';
import { opportunityPageLayoutProps } from '../../../components/layouts/utils';
import { getOpportunityProtectedLayout } from '../../../components/layouts/OpportunityProtectedLayout';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const IconWrapper = classed(
  'div',
  'flex items-center justify-center rounded-10 size-[1.875rem]',
);

const options = [
  {
    icon: (
      <IconWrapper className="bg-action-upvote-float">
        <VIcon secondary className="text-action-upvote-default" />
      </IconWrapper>
    ),
    title: 'Your profile is ready',
    description: (
      <>You&apos;ve provided all the details we need for this job match.</>
    ),
  },
  {
    icon: (
      <IconWrapper className="border-border-subtlest-tertiary border">
        <Typography type={TypographyType.Body} bold>
          2
        </Typography>
      </IconWrapper>
    ),
    title: 'We reach out to the recruiter',
    description: (
      <>We&apos;ll confirm mutual interest before making an introduction.</>
    ),
  },
  {
    icon: (
      <IconWrapper className="border-border-subtlest-tertiary border">
        <Typography type={TypographyType.Body} bold>
          3
        </Typography>
      </IconWrapper>
    ),
    title: 'We connect you directly',
    description: (
      <>
        If it&apos;s a yes on both sides, you&apos;ll be introduced via your
        chosen channel.
      </>
    ),
  },
];

const DonePage = (): ReactElement => {
  const { isSubscribed } = usePushNotificationContext();

  return (
    <div className="tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row mx-4 flex w-auto max-w-full flex-col gap-4">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="items-center gap-4">
          <div className="rounded-10 bg-action-upvote-float size-12">
            <VIcon
              size={IconSize.Size48}
              className="text-action-upvote-default"
              secondary
            />
          </div>
          <Typography type={TypographyType.LargeTitle} bold center>
            You&#39;re all set!
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            You&apos;ve completed everything needed for this job match.
            We&apos;ll take it from here.
          </Typography>
        </FlexCol>
        <FlexCol>
          <div className="rounded-16 border-border-subtlest-tertiary gap-2 border px-3 py-3.5">
            <FlexCol className="flex-1 gap-2 text-left">
              <Typography type={TypographyType.Callout}>
                What happens next
              </Typography>
              <ul className="flex flex-col gap-4">
                {options.map(({ icon, title, description }) => (
                  <li key={title}>
                    <FlexRow className="gap-2">
                      {icon}
                      <FlexCol className="flex-1">
                        <Typography type={TypographyType.Callout} bold>
                          {title}
                        </Typography>
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                        >
                          {description}
                        </Typography>
                      </FlexCol>
                    </FlexRow>
                  </li>
                ))}
              </ul>
            </FlexCol>
            <Divider className="bg-border-subtlest-tertiary my-4 flex" />
            <FlexCol className="gap-2">
              <Typography>Your contact methods</Typography>
              <FlexRow className="gap-2">
                <FlexRow className="rounded-10 border-border-subtlest-tertiary items-center gap-2 border px-3 py-1">
                  <VIcon
                    className="text-accent-avocado-default"
                    size={IconSize.Small}
                  />{' '}
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                  >
                    Email
                  </Typography>
                </FlexRow>
                {isSubscribed && (
                  <FlexRow className="rounded-10 border-border-subtlest-tertiary items-center gap-2 border px-3 py-1">
                    <VIcon
                      className="text-accent-avocado-default"
                      size={IconSize.Small}
                    />{' '}
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Tertiary}
                    >
                      Push notification
                    </Typography>
                  </FlexRow>
                )}
              </FlexRow>
            </FlexCol>
          </div>
        </FlexCol>
        <FlexCol className="items-center gap-4">
          <Link href={webappUrl} passHref>
            <Button
              tag="a"
              size={ButtonSize.Large}
              variant={ButtonVariant.Primary}
              className="tablet:w-80 w-full"
              rel={anchorDefaultRel}
            >
              Back to daily.dev
            </Button>
          </Link>
          <CandidatePreferenceButton
            label="Optimize future matches"
            targetId={TargetId.OpportunityDonePage}
            className="tablet:w-80 w-full"
          />
        </FlexCol>
      </FlexCol>
    </div>
  );
};

DonePage.getLayout = getOpportunityProtectedLayout;
DonePage.layoutProps = {
  ...opportunityPageLayoutProps,
  hideBackButton: true,
  seo,
};

export default DonePage;
