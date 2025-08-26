import type { ReactElement } from 'react';
import React, { useState } from 'react';

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
import { useRouter } from 'next/router';
import classNames from 'classnames';
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
    href: `${webappUrl}jobs/job-123/preference#semi-active-done`,
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
  const [option, setOption] = useState(null);
  const { push, back } = useRouter();
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
            We only reach out when it&apos;s worth it. Tell us where you stand
            so we can match you with the right opportunities, or step back
            entirely until you&apos;re ready.
          </Typography>
        </FlexCol>
        <FlexCol className="gap-2">
          {options.map(({ icon, title, description, href }) => (
            <Button
              key={title}
              variant={ButtonVariant.Option}
              className={classNames(
                '!h-auto w-auto gap-3 border border-border-subtlest-tertiary !p-3',
                {
                  'bg-surface-float': option === href,
                },
              )}
              onClick={() => setOption(href)}
            >
              <div className="relative top-0.5 flex size-12 items-center justify-center rounded-10">
                {icon}
              </div>
              <FlexCol className="flex-1 text-left">
                <Typography
                  color={TypographyColor.Primary}
                  type={TypographyType.Body}
                  bold
                >
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
            onClick={() => back()}
          >
            Back
          </Button>
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
            disabled={!option}
            onClick={() => option && push(option)}
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
