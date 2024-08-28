import { useQuery } from '@tanstack/react-query';
import { UserCompany } from '../../lib/userCompany';
import { GET_USER_COMPANIES } from '../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { gqlClient } from '../../graphql/common';

interface UseUserCompaniesQuery {
  userCompanies: UserCompany[];
  isVerified: boolean;
  isLoading: boolean;
}
export const useUserCompaniesQuery = (): UseUserCompaniesQuery => {
  const { user, isLoggedIn } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.UserCompanies, user);

  const { data, isLoading } = useQuery(
    queryKey,
    async (): Promise<UserCompany[]> => {
      const res = await gqlClient.request(GET_USER_COMPANIES);

      return res.companies;
    },
    {
      staleTime: StaleTime.Default,
      enabled: isLoggedIn,
    },
  );

  return {
    userCompanies: data,
    isVerified: !isLoading && !!data?.[0]?.company,
    isLoading,
  };
};
