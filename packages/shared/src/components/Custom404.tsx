import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from './utilities/Link';
import { PageContainer } from './utilities';
import { ButtonV2, ButtonVariant } from './buttons/ButtonV2';
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
          <ButtonV2 tag="a" variant={ButtonVariant.Primary}>
            Go home
          </ButtonV2>
        </Link>
      </div>
    </PageContainer>
  );
}
