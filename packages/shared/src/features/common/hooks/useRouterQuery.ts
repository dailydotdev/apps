import { useSearchParams } from 'next/navigation';

export const useRouterQuery = () => {
  const params = useSearchParams();
  return {
    query: Object.fromEntries(params.entries()),
  };
};
