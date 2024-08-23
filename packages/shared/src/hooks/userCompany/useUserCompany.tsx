import { useMutation } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { ADD_USER_COMPANY_MUTATION } from '../../graphql/users';

interface UseUserCompany {
  submitWorkEmail: (email: string) => void;
}
export const useUserCompany = (): UseUserCompany => {
  const { mutate: submitWorkEmail } = useMutation((email: string) =>
    gqlClient.request(ADD_USER_COMPANY_MUTATION, { email }),
  );
  return {
    submitWorkEmail,
  };
};
