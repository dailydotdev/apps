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
    description:
      'I’m in the market and ready to move. This one just wasn’t a fit.',
  },
  {
    icon: <SemiActiveIcon size={IconSize.XLarge} />,
    title: 'Open only if it’s right',
    description:
      'I’m happy where I am, but I’d explore something truly exceptional.',
  },
  {
    icon: <PassiveIcon size={IconSize.XLarge} />,
    title: 'Not looking right now',
    description:
      'I’m not open to opportunities right now. Step back until I say otherwise.',
  },
];

const DeclinePage = (): ReactElement => {
  return (
    <div className="mx-auto flex w-full max-w-[35rem] flex-col gap-4 laptop:flex-row">
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
          {options.map(({ icon, title, description }) => (
            <Button
              key={title}
              variant={ButtonVariant.Option}
              className="!h-auto w-full gap-3 border border-border-subtlest-tertiary px-3 py-3.5"
            >
              <div className="flex size-12 items-center justify-center rounded-10 bg-surface-float">
                {icon}
              </div>
              <div className="text-left">
                <Typography type={TypographyType.Body} bold>
                  {title}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {description}
                </Typography>
              </div>
            </Button>
          ))}
        </FlexCol>
        <div className="rounded-10 bg-surface-float p-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            💡 Tip: You can update this anytime in your job preferences so we
            always act on your terms.
          </Typography>
        </div>
        <FlexRow className="justify-between">
          <Button size={ButtonSize.Large} variant={ButtonVariant.Tertiary}>
            Back
          </Button>
          <Button size={ButtonSize.Large} variant={ButtonVariant.Primary}>
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
