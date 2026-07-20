import { queryOptions } from '@tanstack/react-query';
import {
  getInterest,
  getInterestFindings,
  getInterestPosts,
  getInterests,
} from '../../graphql/interests';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { LoggedUser } from '../../lib/user';

export const interestsQueryOptions = (user?: Pick<LoggedUser, 'id'>) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.Interests, user),
    queryFn: getInterests,
    enabled: !!user?.id,
    staleTime: 0,
  });

export const interestQueryOptions = (
  id: string,
  user?: Pick<LoggedUser, 'id'>,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.Interests, user, id),
    queryFn: () => getInterest(id),
    enabled: !!user?.id && !!id,
  });

export const interestFindingsQueryOptions = (
  id: string,
  user?: Pick<LoggedUser, 'id'>,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.InterestFindings, user, id),
    queryFn: () => getInterestFindings(id),
    enabled: !!user?.id && !!id,
  });

export const interestPostsQueryOptions = (
  id: string,
  user?: Pick<LoggedUser, 'id'>,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.InterestFindings, user, id, 'posts'),
    queryFn: () => getInterestPosts(id),
    enabled: !!user?.id && !!id,
  });
