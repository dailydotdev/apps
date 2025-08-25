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
import { MagicIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { briefButtonBg } from '@dailydotdev/shared/src/styles/custom';
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

const PreferenceDonePage = (): ReactElement => {
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="items-center gap-4">
          <div className="size-12 rounded-10 bg-action-upvote-float">
            <VIcon
              size={IconSize.Size48}
              className="text-action-upvote-default"
              secondary
            />
          </div>
          <Typography type={TypographyType.LargeTitle} bold center>
            Your preferences are now locked in!
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            We’ll only reach out when an opportunity meets the conditions you’ve
            set. No noise, no wasted time.
          </Typography>
        </FlexCol>
        <FlexCol>
          <div
            className="gap-2 rounded-16 px-3 py-3.5 text-black"
            style={{
              background: briefButtonBg,
            }}
          >
            <FlexCol className="flex-1 gap-2 text-left">
              <FlexRow className="items-center gap-1">
                <MagicIcon size={IconSize.Small} />
                <Typography type={TypographyType.Body} bold>
                  What’s next?
                </Typography>
              </FlexRow>
              <ul className="flex list-disc flex-col pl-5">
                <li>
                  We’ll use your preferences to filter every role before it
                  reaches you
                </li>
                <li>You’ll hear from us only when there’s a genuine match</li>
                <li>
                  You can update your preferences anytime in your settings
                </li>
              </ul>
            </FlexCol>
          </div>
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
        <FlexCol className="items-center gap-4">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full tablet:w-80"
            tag="a"
            rel={anchorDefaultRel}
            href={webappUrl}
          >
            Back to daily.dev
          </Button>
        </FlexCol>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

PreferenceDonePage.getLayout = getPageLayout;
PreferenceDonePage.layoutProps = {
  className: 'gap-10 laptop:pt-10 pb-10',
  screenCentered: true,
  hideBackButton: true,
  seo,
};

export default PreferenceDonePage;
