import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { NextSeo } from 'next-seo';
import { checkIsExtension } from '@dailydotdev/shared/src/lib/func';
import type { Environments } from '@paddle/paddle-js';
import { initializePaddle } from '@paddle/paddle-js';
import { getLayout } from '../components/layouts/NoSidebarLayout';

const PayPage = (): ReactElement => {
  useEffect(() => {
    if (checkIsExtension()) {
      // Payment not available on extension
      return;
    }

    initializePaddle({
      environment:
        (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as Environments) ||
        'production',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
      checkout: {
        settings: {
          displayMode: 'inline',
          frameTarget: 'checkout-container',
          frameInitialHeight: 500,
          frameStyle:
            'width: 100%; background-color: transparent; border: none;',
          theme: 'dark',
          variant: 'one-page',
        },
      },
    });
  }, []);

  return (
    <>
      <NextSeo nofollow noindex />
      <div className="laptop:h-fit laptop:w-[34.875rem] m-auto flex h-full w-full flex-col gap-6">
        <div className="bg-background-default flex w-full flex-1 justify-center">
          <div className="rounded-16 border-border-subtlest-tertiary mt-10 flex-1 border bg-black p-6">
            <div className="checkout-container" />
          </div>
        </div>
      </div>
    </>
  );
};

PayPage.getLayout = getLayout;
PayPage.layoutProps = { screenCentered: true };

export default PayPage;
