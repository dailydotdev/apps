import React, { ReactElement } from 'react';
import { NextSeoProps } from 'next-seo';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks/useFeedLayout';
import classNames from 'classnames';
import { FeedSettingsEdit } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEdit';
import { useRouter } from 'next/router';

import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Edit feed'),
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const EditFeedPage = (): ReactElement => {
  const router = useRouter();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const feedSlugOrId = router.query.slugOrId as string;

  return (
    <FeedPageLayoutComponent className={classNames('!p-0')}>
      <FeedSettingsEdit feedSlugOrId={feedSlugOrId} />
    </FeedPageLayoutComponent>
  );
};

EditFeedPage.getLayout = getMainFeedLayout;
EditFeedPage.layoutProps = { ...mainFeedLayoutProps, seo };

export default EditFeedPage;
