import type { ReactElement } from 'react';
import React from 'react';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import type { Props } from '../../posts/[id]';
import { PostPage, getStaticPaths, getStaticProps } from '../../posts/[id]';

export { getStaticPaths, getStaticProps };

// Mirror of `/posts/[id]` that renders the layout v2 shell in the initial
// HTML. `proxy.ts` rewrites here for sessions already resolved to v2; the
// route is unreachable directly (next.config.ts redirects it back).
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
