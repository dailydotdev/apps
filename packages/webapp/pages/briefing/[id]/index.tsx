import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';

import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { getLayout as getFooterNavBarLayout } from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import ProtectedPage from '../../../components/ProtectedPage';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const Page = (): ReactElement => {
  return (
    <ProtectedPage>
      <Modal isOpen>Brief</Modal>
    </ProtectedPage>
  );
};

const getBriefingLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  title: getTemplatedTitle('Presidential briefing'),
  description: 'TODO feat-brief SEO description',
  nofollow: true,
  noindex: true,
};

Page.getLayout = getBriefingLayout;
Page.layoutProps = { seo, screenCentered: false };

export default Page;
