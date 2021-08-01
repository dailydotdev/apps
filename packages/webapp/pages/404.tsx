import React, { ReactElement } from 'react';
import HelloWorldSvg from '@dailydotdev/shared/src/svg/HelloWorldSvg';
import { NextSeo } from 'next-seo';

export default function Custom404(): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      data-testid="notFound"
    >
      <NextSeo title="Page not found" nofollow noindex />
      <HelloWorldSvg
        style={{ width: '55%', maxWidth: '32.75rem' }}
        className="mb-10 self-center"
      />
      <h1 className="mx-9 text-center break-words font-bold typo-title1">
        Oops, this page couldn’t be found
      </h1>
    </div>
  );
}
