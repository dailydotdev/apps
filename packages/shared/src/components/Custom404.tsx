import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { PageContainer } from './utilities';
import NotFoundSvg from '../svg/NotFoundSvg';
import { Button, ButtonVariant } from './buttons/ButtonV2';

interface Custom404Props {
  children?: ReactNode;
}

export default function Custom404({ children }: Custom404Props): ReactElement {
  return (
    <PageContainer
      className="min-h-page !items-center justify-center"
      data-testid="notFound"
    >
      {children}
      <div className="flex w-full max-w-[26.25rem] flex-col items-center gap-6 text-center">
        <NotFoundSvg />
        <h1 className="font-bold typo-title1">Why are you here?</h1>
        <p className="text-theme-label-tertiary typo-callout">
          You’re not supposed to be here.
        </p>
        <Link href="/" passHref>
          <Button tag="a" variant={ButtonVariant.Primary}>
            Go home
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
