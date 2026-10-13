import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import classNames from 'classnames';
import { QuestButton } from '@dailydotdev/shared/src/components/quest/QuestButton';
import { LayoutHeader } from '@dailydotdev/shared/src/components/layout/common';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  ResponsivePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import ProtectedPage from '../../components/ProtectedPage';
import { defaultOpenGraph } from '../../next-seo';

const seoTitles = getPageSeoTitles('Daily quests');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Complete your daily and weekly quests to earn rewards, climb levels, and keep your streak going.',
  nofollow: true,
  noindex: true,
};

function DailyQuestsPage(): ReactElement {
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;
  const isPhone = useIsPhone();

  return (
    <ProtectedPage>
      {isV2Laptop && <PageHeader title="Daily quests" />}
      {isPhone && <ShellPage title="Daily quests" />}
      <div className="mx-auto w-full max-w-[42.5rem]">
        {!isV2Laptop && !isPhone && (
          <LayoutHeader
            className={classNames(
              '!mb-0 hidden gap-2 border-b px-4 tablet:flex',
              pageBorders,
            )}
          >
            <Typography
              type={TypographyType.Title3}
              bold
              color={TypographyColor.Primary}
              className="flex-1"
            >
              Daily quests
            </Typography>
          </LayoutHeader>
        )}
        <ResponsivePageContainer className="!mx-0 !w-full !max-w-full gap-6 pb-10 pt-1 tablet:pt-6">
          <div className="-mx-3 tablet:mx-0">
            <QuestButton panelOnly />
          </div>
        </ResponsivePageContainer>
      </div>
    </ProtectedPage>
  );
}

const getDailyQuestsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DailyQuestsPage.getLayout = getDailyQuestsLayout;
DailyQuestsPage.layoutProps = { screenCentered: false, seo };

export default DailyQuestsPage;
