import React, { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { PageContainer } from './utilities';
import { Button, ButtonVariant } from './buttons/Button';
import { useThemedAsset } from '../hooks/utils';

interface Custom404Props {
  children?: ReactNode;
}

export default function Custom404({ children }: Custom404Props): ReactElement {
  const { notFound } = useThemedAsset();

  return (
    <PageContainer
      className="min-h-page !items-center justify-center"
      data-testid="notFound"
    >
      {children}
      <div className="flex w-full max-w-[26.25rem] flex-col items-center gap-6 text-center">
        <img src={notFound} alt="404 - Page not found" />
        <h1 className="font-bold typo-large-title">Why are you here?</h1>
        <p className="text-text-tertiary typo-callout">
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
