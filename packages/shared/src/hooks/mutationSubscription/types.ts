import type {
  Mutation,
  MutationStatus,
  QueryClient,
} from '@tanstack/react-query';

export type UseMutationMatcherProps<TVariables = unknown> = {
  status: MutationStatus;
  mutation: Mutation<unknown, unknown, unknown, unknown>;
  variables?: TVariables;
};

export type UseMutationMatcher<TVariables = unknown> = ({
  mutation,
  variables,
}: UseMutationMatcherProps<TVariables>) => boolean;

export type UseMutationSubscriptionProps<TVariables = unknown> = {
  matcher: UseMutationMatcher<TVariables>;
  callback: ({
    mutation,
    queryClient,
    variables,
  }: UseMutationMatcherProps<TVariables> & {
    queryClient: QueryClient;
    variables?: TVariables;
  }) => void;
};

export type UseMutationSubscription = void;
