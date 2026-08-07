import type { ReactElement } from 'react';
import React from 'react';
import {
  getStaticPaths,
  getStaticProps,
  PostPage,
  postPageLayoutProps,
} from '../../posts/[id]/index';
import type { Props } from '../../posts/[id]/index';
import { getLayout } from '../../../components/layouts/MainLayout';

const LayoutV2PostPage = (props: Props): ReactElement => (
  <PostPage {...props} isLayoutV2 />
);

LayoutV2PostPage.getLayout = getLayout;
LayoutV2PostPage.layoutProps = {
  ...postPageLayoutProps,
  layoutVariant: 'v2',
};

export { getStaticPaths, getStaticProps };
export default LayoutV2PostPage;
