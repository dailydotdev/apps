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
      className="justify-center min-h-page !items-center"
      data-testid="notFound"
    >
      {children}
      <div className="flex flex-col gap-6 items-center w-full text-center max-w-[26.25rem]">
        <NotFoundSvg />
        <h1 className="font-bold typo-title1">Why are you here?</h1>
        <p className="typo-callout text-theme-label-tertiary">
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
