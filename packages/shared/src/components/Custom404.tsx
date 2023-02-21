import React, { ReactElement, ReactNode } from 'react';
import HelloWorldSvg from '../svg/HelloWorldSvg';
import { PageContainer } from './utilities';

interface Custom404Props {
  children?: ReactNode;
}

export default function Custom404({ children }: Custom404Props): ReactElement {
  return (
    <PageContainer
      className="min-h-page items-center justify-center"
      data-testid="notFound"
    >
      {children}
      <HelloWorldSvg
        style={{ width: '55%', maxWidth: '32.75rem' }}
        className="-mt-20 mb-10 self-center laptop:-mt-10"
      />
      <h1 className="break-words-overflow mx-9 text-center font-bold typo-title1">
        Oops, this page couldn’t be found
      </h1>
    </PageContainer>
  );
}
