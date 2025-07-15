import user from '../../__tests__/fixture/loggedUser';
import { useAuthContext } from '../contexts/AuthContext';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiUserTransactionErrorExtension,
} from '../graphql/common';
import { ApiError } from '../graphql/common';
import { UserTransactionStatus } from '../graphql/njord';
import { labels } from '../lib';
import { useToastNotification } from './useToastNotification';

export const useTransactionError = () => {
  const { displayToast } = useToastNotification();
  const { updateUser } = useAuthContext();

  return async (data: ApiErrorResult) => {
    if (
      data.response.errors?.[0]?.extensions?.code ===
      ApiError.BalanceTransactionError
    ) {
      const errorExtensions = data.response
        .errors[0] as ApiResponseError<ApiUserTransactionErrorExtension>;

      if (
        errorExtensions.extensions.status ===
          UserTransactionStatus.InsufficientFunds &&
        errorExtensions.extensions.balance
      ) {
        await updateUser({
          ...user,
          balance: errorExtensions.extensions.balance,
        });
      }
    }

    displayToast(data?.response?.errors?.[0]?.message || labels.error.generic);
  };
};
