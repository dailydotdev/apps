import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { SidecarCart, SidecarStore } from './sidecarMocks';
import { formatMoney, sidecarCart } from './sidecarMocks';

export type FakeStoreVariant = 'browsing' | 'checkout';

const Block = ({ className }: { className: string }): ReactElement => (
  <span className={classNames('block rounded-8 bg-surface-float', className)} />
);

const BrowserChrome = ({ url }: { url: string }): ReactElement => (
  <div className="flex items-center gap-3 border-b border-border-subtlest-tertiary bg-surface-float px-4 py-2.5">
    <span className="flex gap-1.5">
      <span className="size-2.5 rounded-full bg-text-disabled" />
      <span className="size-2.5 rounded-full bg-text-disabled" />
      <span className="size-2.5 rounded-full bg-text-disabled" />
    </span>
    <span className="flex flex-1 items-center rounded-10 bg-background-default px-3 py-1">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {url}
      </Typography>
    </span>
  </div>
);

const StoreHeader = ({ brand }: { brand: string }): ReactElement => (
  <header className="flex items-center gap-6 border-b border-border-subtlest-tertiary px-8 py-5">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Title3}
      color={TypographyColor.Quaternary}
      bold
    >
      {brand}
    </Typography>
    <nav className="flex items-center gap-5">
      {['Shop', 'Collections', 'Support'].map((item) => (
        <Typography
          key={item}
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Disabled}
        >
          {item}
        </Typography>
      ))}
    </nav>
    <span className="ml-auto flex items-center gap-4">
      <Block className="h-8 w-48" />
      <Block className="size-8 rounded-full" />
    </span>
  </header>
);

const ProductCard = ({ index }: { index: number }): ReactElement => (
  <article className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <Block className="h-36 w-full" />
    <Block className={index % 2 === 0 ? 'h-3 w-4/5' : 'h-3 w-3/5'} />
    <Block className="h-3 w-2/5" />
    <span className="mt-1 flex items-center justify-between">
      <Block className="h-4 w-16" />
      <Block className="h-8 w-24 rounded-10" />
    </span>
  </article>
);

const BrowsingBody = (): ReactElement => (
  <div className="flex flex-col gap-8 px-8 py-8">
    <div className="flex h-40 items-center justify-center rounded-16 bg-surface-float">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={TypographyColor.Disabled}
      >
        Sample store page
      </Typography>
    </div>
    <div className="grid grid-cols-2 gap-6 tablet:grid-cols-3 laptop:grid-cols-4">
      {Array.from({ length: 8 }, (unused, index) => (
        <ProductCard key={`product-${index}`} index={index} />
      ))}
    </div>
  </div>
);

const CheckoutBody = ({ cart }: { cart: SidecarCart }): ReactElement => (
  <div className="grid gap-8 px-8 py-8 laptop:grid-cols-[1fr_20rem]">
    <section className="flex flex-col gap-4">
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Title3}
        color={TypographyColor.Quaternary}
        bold
      >
        Checkout
      </Typography>
      {cart.items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-4"
        >
          <Block className="size-16 shrink-0" />
          <span className="flex flex-1 flex-col gap-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Disabled}
            >
              {item.name}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Disabled}
            >
              {item.meta}
            </Typography>
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={TypographyColor.Disabled}
            className="tabular-nums"
          >
            {formatMoney(item.price)}
          </Typography>
        </div>
      ))}
      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
        <Block className="h-3 w-32" />
        <Block className="h-10 w-full rounded-10" />
        <Block className="h-10 w-full rounded-10" />
      </div>
    </section>
    <aside className="flex h-fit flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-5">
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={TypographyColor.Disabled}
        bold
      >
        Order summary
      </Typography>
      <span className="flex items-center justify-between">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Disabled}
        >
          Subtotal
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Disabled}
          className="tabular-nums"
        >
          {formatMoney(cart.subtotal)}
        </Typography>
      </span>
      <span className="flex items-center justify-between">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Disabled}
        >
          Shipping
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Disabled}
        >
          Free
        </Typography>
      </span>
      <Block className="h-px w-full rounded-none" />
      <Block className="h-10 w-full rounded-10" />
      <Block className="h-3 w-3/4" />
    </aside>
  </div>
);

interface FakeStorePageProps {
  store: SidecarStore;
  variant?: FakeStoreVariant;
  cart?: SidecarCart;
  children?: ReactNode;
}

export const FakeStorePage = ({
  store,
  variant = 'browsing',
  cart = sidecarCart,
  children,
}: FakeStorePageProps): ReactElement => (
  <div className="relative min-h-screen w-full overflow-hidden bg-background-default">
    <BrowserChrome
      url={`${store.domain}${
        variant === 'checkout' ? '/cart/checkout' : '/collections/keyboards'
      }`}
    />
    <StoreHeader brand={store.brand} />
    {variant === 'checkout' ? <CheckoutBody cart={cart} /> : <BrowsingBody />}
    {children}
  </div>
);
