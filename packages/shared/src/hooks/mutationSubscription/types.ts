import { Mutation, MutationStatus, QueryClient } from '@tanstack/react-query';

export type UseMutationMatcherProps = {
  status: MutationStatus;
  mutation: Mutation<unknown, unknown, unknown>;
};

export type UseMutationMatcher = ({
  mutation,
}: UseMutationMatcherProps) => boolean;

export type UseMutationSubscriptionProps = {
  matcher: UseMutationMatcher;
  callback: ({
    mutation,
    queryClient,
  }: UseMutationMatcherProps & {
    queryClient: QueryClient;
  }) => void;
};

export type UseMutationSubscription = void;
