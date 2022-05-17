import React, { ReactElement } from 'react';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { NextSeo } from 'next-seo';

export default function Custom404Seo(): ReactElement {
  return (
    <Custom404>
      <NextSeo title="Page not found" nofollow noindex />
    </Custom404>
  );
}
