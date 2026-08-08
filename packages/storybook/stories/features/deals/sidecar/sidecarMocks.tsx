import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import type { Decorator } from '@storybook/react-vite';

export type SidecarOfferKind = 'code' | 'credit';

export interface SidecarOffer {
  id: string;
  title: string;
  kind: SidecarOfferKind;
  code?: string;
  valueLabel: string;
  verified: {
    count: number;
    lastAgo: string;
  };
}

export interface SidecarStore {
  id: string;
  domain: string;
  brand: string;
  followersOnDaily: number;
  offers: SidecarOffer[];
}

export const sidecarStores: SidecarStore[] = [
  {
    id: 'keychron',
    domain: 'keychron.com',
    brand: 'Keychron',
    followersOnDaily: 512,
    offers: [
      {
        id: 'keychron-15',
        title: '15% off mechanical keyboards',
        kind: 'code',
        code: 'DAILYDEV15',
        valueLabel: '15% off',
        verified: { count: 41, lastAgo: '2 hours ago' },
      },
      {
        id: 'keychron-credit',
        title: '$10 credit on your first order',
        kind: 'credit',
        valueLabel: '$10 credit',
        verified: { count: 18, lastAgo: 'yesterday' },
      },
      {
        id: 'keychron-shipping',
        title: 'Free shipping over $99',
        kind: 'code',
        code: 'SHIPFREE99',
        valueLabel: 'Free shipping',
        verified: { count: 7, lastAgo: '3 days ago' },
      },
    ],
  },
  {
    id: 'jetbrains',
    domain: 'jetbrains.com',
    brand: 'JetBrains',
    followersOnDaily: 3120,
    offers: [
      {
        id: 'jetbrains-pack',
        title: '30% off the All Products Pack',
        kind: 'code',
        code: 'DEVS30',
        valueLabel: '30% off',
        verified: { count: 12, lastAgo: '5 hours ago' },
      },
      {
        id: 'jetbrains-renewal',
        title: '25% off your first renewal',
        kind: 'code',
        code: 'RENEW25',
        valueLabel: '25% off',
        verified: { count: 63, lastAgo: '40 minutes ago' },
      },
      {
        id: 'jetbrains-credit',
        title: '$25 back on annual licences',
        kind: 'credit',
        valueLabel: '$25 back',
        verified: { count: 9, lastAgo: '2 days ago' },
      },
    ],
  },
  {
    id: 'digitalocean',
    domain: 'digitalocean.com',
    brand: 'DigitalOcean',
    followersOnDaily: 8420,
    offers: [
      {
        id: 'digitalocean-credit',
        title: '$200 credit for 60 days',
        kind: 'credit',
        valueLabel: '$200 free',
        verified: { count: 128, lastAgo: '11 minutes ago' },
      },
      {
        id: 'digitalocean-droplet',
        title: '15% off your first three months',
        kind: 'code',
        code: 'DEVDO15',
        valueLabel: '15% off',
        verified: { count: 74, lastAgo: '6 hours ago' },
      },
    ],
  },
];

export const getSidecarStore = (id: string): SidecarStore =>
  sidecarStores.find((store) => store.id === id) ?? sidecarStores[0];

export interface SidecarCartItem {
  id: string;
  name: string;
  meta: string;
  price: number;
}

export interface SidecarCart {
  items: SidecarCartItem[];
  subtotal: number;
  shipping: number;
}

export const sidecarCart: SidecarCart = {
  items: [
    {
      id: 'cart-keyboard',
      name: 'Wireless mechanical keyboard, 75%',
      meta: 'Carbon black / Brown switches',
      price: 129,
    },
    {
      id: 'cart-keycaps',
      name: 'OSA PBT keycap set',
      meta: 'Dev edition',
      price: 39,
    },
    {
      id: 'cart-cable',
      name: 'Braided USB-C cable',
      meta: '1.8m',
      price: 14,
    },
  ],
  subtotal: 182,
  shipping: 0,
};

export const sidecarAutoApplyCodes = [
  'DEVS30',
  'KEYB25',
  'SHIPFREE99',
  'DAILYDEV15',
];

export const sidecarSavings = 18.2;

export const formatMoney = (value: number): string =>
  `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches);
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
};

export const SidecarSurface = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <div className="min-h-screen bg-background-default text-text-primary">
    {children}
  </div>
);

export const withSidecar = (): Decorator =>
  function SidecarDecorator(Story) {
    return (
      <SidecarSurface>
        <Story />
      </SidecarSurface>
    );
  };
