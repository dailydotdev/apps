import type { ReactElement } from 'react';
import React from 'react';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import type { Props } from '../../posts/[id]';
import { PostPage, getStaticPaths, getStaticProps } from '../../posts/[id]';

export { getStaticPaths, getStaticProps };

// Reachable only through the proxy rewrite; next.config.ts redirects direct
// access back to `/posts/[id]`.
const LayoutV2PostPage = (props: Props): ReactElement => (
  <PostPage {...props} />
);

const layoutProps: MainLayoutProps = {
  ...PostPage.layoutProps,
  layoutVariant: 'v2',
};

LayoutV2PostPage.getLayout = PostPage.getLayout;
LayoutV2PostPage.layoutProps = layoutProps;

export default LayoutV2PostPage;
