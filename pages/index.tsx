import React, { ReactElement } from 'react';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import MainFeedPage, {
  getMainFeedLayout,
} from '../components/layouts/MainFeedPage';

const Popular = (): ReactElement => {
  return (
    <MainFeedPage query={ANONYMOUS_FEED_QUERY} queryIfLogged={FEED_QUERY} />
  );
};

Popular.getLayout = getMainFeedLayout;

export default Popular;
