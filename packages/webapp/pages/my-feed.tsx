import React, { Fragment, ReactElement } from 'react';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';

const MyFeed = (): ReactElement => <></>;

MyFeed.getLayout = getMainFeedLayout;
MyFeed.layoutProps = mainFeedLayoutProps;

export default MyFeed;
