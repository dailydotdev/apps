import type { ComponentType, ReactElement } from 'react';
import React, { lazy, Suspense } from 'react';

// next/dynamic's loader only runs inside Next, so outside it a dynamic
// component renders nothing. React.lazy does the same job here.

type Loaded = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<Loaded | { default: Loaded }>;

export default function dynamic(
  loader: Loader,
  options?: { loading?: ComponentType },
): ComponentType<Record<string, unknown>> {
  const Lazy = lazy(async () => {
    const loaded = await loader();
    return {
      default: 'default' in loaded ? loaded.default : (loaded as Loaded),
    };
  });
  const Loading = options?.loading;

  const Dynamic = (props: Record<string, unknown>): ReactElement => (
    <Suspense fallback={Loading ? <Loading /> : null}>
      <Lazy {...props} />
    </Suspense>
  );
  return Dynamic;
}
