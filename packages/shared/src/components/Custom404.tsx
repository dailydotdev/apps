import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from './utilities/Link';
import { PageContainer } from './utilities/common';
import { Button, ButtonVariant } from './buttons/Button';
import { cloudinaryCharm404 } from '../lib/image';
import { Image } from './image/Image';

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
        <Image
          className="h-40 w-40 object-contain"
          src={cloudinaryCharm404}
          alt="404 - Page not found"
          loading="lazy"
        />
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
