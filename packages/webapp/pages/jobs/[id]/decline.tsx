import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
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
import {
  ActivelyLookingIcon,
  PassiveIcon,
  SemiActiveIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { getLayout } from '../../../components/layouts/NoSidebarLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const options = [
  {
    icon: <ActivelyLookingIcon size={IconSize.XLarge} />,
    title: 'Active looking',
    href: `${webappUrl}jobs/job-123/preference`,
    description:
      'I’m in the market and ready to move. This one just wasn’t a fit.',
  },
  {
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: 'Open only if it’s right',
    href: `${webappUrl}jobs/job-123/preference`,
    description:
      'I’m happy where I am, but I’d explore something truly exceptional.',
  },
  {
    icon: <PassiveIcon size={IconSize.XLarge} />,
    title: 'Not looking right now',
    href: `${webappUrl}jobs/job-123/passive-done`,
    description:
      'I’m not open to opportunities right now. Step back until I say otherwise.',
  },
];

const DeclinePage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            Help us respect your time
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            We only reach out when it’s worth it. Tell us where you stand so we
            can match you with the right opportunities, or step back entirely
            until you’re ready.
          </Typography>
        </FlexCol>
        <FlexCol className="gap-2">
          {options.map(({ icon, title, description, href }) => (
            <Link href={href} passHref key={title}>
              <Button
                variant={ButtonVariant.Option}
                className="!h-auto w-auto gap-3 border border-border-subtlest-tertiary px-3 py-3.5"
                tag="a"
              >
                <div className="flex size-12 items-center justify-center rounded-10 bg-surface-float">
                  {icon}
                </div>
                <FlexCol className="flex-1 text-left">
                  <Typography type={TypographyType.Body} bold>
                    {title}
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {description}
                  </Typography>
                </FlexCol>
              </Button>
            </Link>
          ))}
        </FlexCol>
        <div className="rounded-10 bg-surface-float p-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            💡 <strong>Tip:</strong> You can update this anytime in your{' '}
            <a
              href="#"
              className="text-text-link"
              target="_blank"
              rel={anchorDefaultRel}
            >
              job preferences
            </a>{' '}
            so we always act on your terms.
          </Typography>
        </div>
        <FlexRow className="justify-between">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Tertiary}
            className="hidden laptop:flex"
          >
            Back
          </Button>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
          >
            Save and Continue
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

DeclinePage.getLayout = getPageLayout;
DeclinePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  seo,
};

export default DeclinePage;
