import { useQuery } from '@tanstack/react-query';
import type { UserCompany } from '../../lib/userCompany';
import { GET_USER_COMPANIES } from '../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { gqlBatchRequest } from '../../graphql/batch';

interface UseUserCompaniesQuery {
  userCompanies: UserCompany[];
  isVerified: boolean;
  isLoading: boolean;
}
export const useUserCompaniesQuery = (): UseUserCompaniesQuery => {
  const { user, isLoggedIn } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.UserCompanies, user);

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: async (): Promise<UserCompany[]> => {
      const res = await gqlBatchRequest<{ companies: UserCompany[] }>(
        GET_USER_COMPANIES,
      );

      return res.companies;
    },
    staleTime: StaleTime.Default,
    enabled: isLoggedIn,
  });

  return {
    userCompanies: data ?? [],
    isVerified: !isPending && !!data?.[0]?.company,
    isLoading: isPending,
  };
};
