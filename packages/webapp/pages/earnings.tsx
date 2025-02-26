import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';

import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import ProtectedPage from '../components/ProtectedPage';
import { getLayout } from '../components/layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';

const Earnings = (): ReactElement => {
  return (
    <ProtectedPage>
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
          <p>Earnings</p>
        </main>
        <PageWidgets>Some widgets on the right</PageWidgets>
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
