import type { ComponentType, ReactElement, ReactNode } from 'react';
import React from 'react';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';

type LayoutPage<Props> = ComponentType<Props> & {
  getLayout?: (...args: never[]) => ReactNode;
  layoutProps?: Record<string, unknown>;
};

export const withLayoutVariant = <Props extends object>(
  Page: LayoutPage<Props>,
  layoutVariant: NonNullable<MainLayoutProps['layoutVariant']>,
): LayoutPage<Props> => {
  const LayoutVariantPage = (props: Props): ReactElement => <Page {...props} />;

  LayoutVariantPage.getLayout = Page.getLayout;
  LayoutVariantPage.layoutProps = {
    ...Page.layoutProps,
    layoutVariant,
  };

  return LayoutVariantPage;
};
