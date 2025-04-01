import { useSearchParams } from 'next/navigation';

export const useRouterQuery = (): {
  query: Record<string, string>;
} => {
  const params = useSearchParams();
  return {
    query: Object.fromEntries(params.entries()),
  };
};
