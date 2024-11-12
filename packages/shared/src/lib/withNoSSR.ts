import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export const withNoSSR = <T>(Component: ComponentType<T>): ComponentType<T> =>
  dynamic<T>(() => Promise.resolve<ComponentType<T>>(Component), {
    ssr: false,
  });
