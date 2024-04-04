import { Mutation, MutationStatus, QueryClient } from '@tanstack/react-query';

export type UseMutationMatcherProps<TVariables = unknown> = {
  status: MutationStatus;
  mutation: Mutation<unknown, unknown, unknown>;
  variables?: TVariables;
};

export type UseMutationMatcher<TVariables> = ({
  mutation,
  variables,
}: UseMutationMatcherProps<TVariables>) => boolean;

export type UseMutationSubscriptionProps<TVariables = unknown> = {
  matcher: UseMutationMatcher<TVariables>;
  callback: ({
    mutation,
    queryClient,
    variables,
  }: UseMutationMatcherProps & {
    queryClient: QueryClient;
    variables?: TVariables;
  }) => void;
};

export type UseMutationSubscription = void;
