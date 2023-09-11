import { Mutation, QueryClient } from 'react-query';

export type UseMutationMatcherProps = {
  mutation: Mutation;
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
