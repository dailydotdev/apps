import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';

import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { searchDocs } from '@dailydotdev/shared/src/lib/constants';
import {
  DevPlusIcon,
  DocsIcon,
  FeedbackIcon,
} from '@dailydotdev/shared/src/components/icons';
import { ListCardDivider } from '@dailydotdev/shared/src/components/cards/common/Card';
import { WidgetContainer } from '@dailydotdev/shared/src/components/widgets/common';
import { meta } from 'eslint-plugin-react/lib/rules/jsx-props-no-spread-multi';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import ProtectedPage from '../components/ProtectedPage';
import docs = meta.docs;

const Earnings = (): ReactElement => {
  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          <header className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-2">
            <Typography type={TypographyType.Title3} bold>
              Core wallet
            </Typography>
            <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
              Buy Cores
            </Button>
          </header>
          <div className="flex gap-6 p-6">
            <p>Earnings</p>
          </div>
        </main>
        <PageWidgets className="flex gap-4 py-6">
          <WidgetContainer className="flex flex-col gap-4 p-6">
            <div className="flex justify-between">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Callout}
                bold
                className="flex gap-1"
                color={TypographyColor.Plus}
              >
                <DevPlusIcon size={IconSize.XSmall} /> Plus
              </Typography>
              🎁
            </div>
            <Typography type={TypographyType.Body} bold>
              Get 100 Cores every month with daily.dev Plus and access pro
              features to fast-track your growth.
            </Typography>
            <Button className="mt-2" variant={ButtonVariant.Primary}>
              Upgrade to Plus
            </Button>
          </WidgetContainer>
          <WidgetContainer className="flex flex-col">
            <div className="flex justify-around p-4">
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={docs}
                icon={<FeedbackIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Docs
              </Button>
              <ListCardDivider className="mx-3" />
              <Button
                tag="a"
                target="_blank"
                rel="noopener"
                href={searchDocs}
                icon={<DocsIcon />}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
              >
                Terms
              </Button>
            </div>
          </WidgetContainer>
        </PageWidgets>
      </div>
    </ProtectedPage>
  );
};

const getEarningsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = { title: 'Earnings', nofollow: true, noindex: true };

Earnings.getLayout = getEarningsLayout;
Earnings.layoutProps = { seo, screenCentered: false };

export default Earnings;
