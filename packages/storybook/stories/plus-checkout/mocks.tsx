import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { PaymentContext } from '@dailydotdev/shared/src/contexts/payment/context';
import { GiftUserContext } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import type { ProductPricingPreview } from '@dailydotdev/shared/src/graphql/paddle';
import { PurchaseType } from '@dailydotdev/shared/src/graphql/paddle';
import { LogoWithPlus } from '@dailydotdev/shared/src/components/Logo';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { cloudinaryPlusBackground } from '@dailydotdev/shared/src/lib/image';

/* Context for the PRODUCTION Plus components (PlusInfo, PlusList, …) that the
   "Today" control page renders. The new design doesn't need any of this: it
   takes plain props (checkout/). Prices are the live Paddle USD prices. */

const noop = (): void => undefined;
export const productOptions: ProductPricingPreview[] = [
  {
    priceId: 'pri_annual',
    price: {
      amount: 89.99,
      formatted: '$89.99',
      monthly: { amount: 7.49, formatted: '$7.49' },
    },
    currency: { code: 'USD', symbol: '$' },
    duration: 'yearly',
    metadata: {
      appsId: 'annual',
      title: 'Annual',
      caption: { copy: 'Popular', color: 'success' },
      idMap: { paddle: 'pri_annual', ios: '' },
    },
  } as never,
  {
    priceId: 'pri_monthly',
    price: { amount: 9.99, formatted: '$9.99' },
    currency: { code: 'USD', symbol: '$' },
    duration: 'monthly',
    metadata: {
      appsId: 'default',
      title: 'Monthly',
      idMap: { paddle: 'pri_monthly', ios: '' },
    },
  } as never,
];

export const giftOneYear: ProductPricingPreview = {
  priceId: 'pri_gift',
  price: { amount: 89.99, formatted: '$89.99' },
  currency: { code: 'USD', symbol: '$' },
  duration: 'one-time',
  metadata: {
    appsId: 'gift_one_year',
    title: 'One-year plan',
    idMap: { paddle: 'pri_gift', ios: '' },
  },
} as never;

const settings = {
  insaneMode: false,
  spaciness: 'roomy',
  loadedSettings: true,
  isRemoteSettingsLoaded: true,
  openNewTab: false,
  sidebarExpanded: true,
  themeMode: 'dark',
  applyThemeMode: noop,
};

export const Providers = ({
  isPlus = false,
  isOrganization = false,
  giftToUser,
  isPlusAvailable = true,
  children,
}: {
  isPlus?: boolean;
  isOrganization?: boolean;
  giftToUser?: { id: string; username: string; name: string; image: string };
  isPlusAvailable?: boolean;
  children: ReactNode;
}): ReactElement => {
  const LogContext = getLogContextStatic();
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
    [],
  );
  const [itemQuantity, setItemQuantity] = useState(1);
  const [priceType, setPriceType] = useState<PurchaseType>(
    isOrganization ? PurchaseType.Organization : PurchaseType.Plus,
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider
        user={
          {
            id: 'sb-user',
            name: 'Dev Dana',
            username: 'devdana',
            email: 'dana@company.dev',
            image:
              'https://media.daily.dev/image/upload/f_auto,q_auto/v1/placeholders/1',
            providers: ['github'],
            isPlus,
          } as never
        }
        firstLoad={false}
        isFetched
        loadingUser={false}
        tokenRefreshed
        loadedUserFromCache
        getRedirectUri={() => ''}
        updateUser={noop as never}
        refetchBoot={noop as never}
        visit={{ visitId: 'sb', sessionId: 'sb' } as never}
        accessToken={null as never}
        squads={[]}
        feeds={undefined}
        geo={{ region: 'IL' } as never}
        isAndroidApp={false}
      >
        <LogContext.Provider
          value={{
            logEvent: noop,
            logEventStart: noop,
            logEventEnd: noop,
            sendBeacon: noop,
          }}
        >
          <SettingsContext.Provider value={settings as never}>
            <PaymentContext.Provider
              value={{
                openCheckout: noop,
                productOptions,
                giftOneYear,
                isPlusAvailable,
                isPricesPending: false,
                isPaddleReady: true,
                isOrganization: priceType === PurchaseType.Organization,
                itemQuantity,
                setItemQuantity,
                checkoutItemsLoading: false,
                priceType,
                setPriceType,
              }}
            >
              <GiftUserContext.Provider
                value={{ giftToUser: giftToUser as never }}
              >
                {children}
              </GiftUserContext.Provider>
            </PaymentContext.Provider>
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};


export const SettingsShim = ({ children }: { children: ReactNode }): ReactElement => (
  <SettingsContext.Provider value={settings as never}>{children}</SettingsContext.Provider>
);

/** The production Plus page surface: dark, the Cloudinary background, the header. */
export const PlusPage = ({
  children,
  header = true,
  className,
  style,
}: {
  children: ReactNode;
  header?: boolean;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <SettingsContext.Provider value={settings as never}>
  <main
    className={classNames(
      'relative flex min-h-full w-full flex-col bg-background-default text-text-primary',
      className,
    )}
    style={style}
  >
    <img
      src={cloudinaryPlusBackground}
      alt=""
      aria-hidden
      className="absolute inset-0 -z-1 h-full w-full object-cover"
    />
    {header && (
      <header className="flex h-16 w-full items-center gap-4 border-b border-border-subtlest-tertiary px-4 laptop:justify-start">
        <Button
          variant={ButtonVariant.Float}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={noop}
        >
          Back
        </Button>
        <LogoWithPlus />
      </header>
    )}
    {children}
  </main>
  </SettingsContext.Provider>
);

