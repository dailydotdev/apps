import type {
  DefaultError,
  Mutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useMutationSubscription } from './mutationSubscription';

export const useQuerySubscription = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  callback: (props: {
    mutation: Mutation<TData, TError, TVariables, TContext>;
    variables: TVariables;
  }) => void,
  { mutationKey }: UseMutationOptions<TData, TError, TVariables, TContext>,
): void => {
  useMutationSubscription({
    matcher: ({ mutation }) => {
      return (
        JSON.stringify(mutation.options.mutationKey) ===
        JSON.stringify(mutationKey)
      );
    },
    callback: ({ mutation, variables: mutationVariables }) => {
      // can potentially use zod here to validate mutation/variables against schema
      // to avoid just casting, but already type safety is much better

      callback({
        mutation: mutation as Mutation<TData, TError, TVariables, TContext>,
        variables: mutationVariables as TVariables,
      });
    },
  });
};
