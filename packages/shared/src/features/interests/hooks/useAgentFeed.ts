import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { interestFindingsQueryOptions } from '../queries';

export type AgentFeedItem = {
  id: string;
  post: Post;
  score: number;
  rationale: string;
  createdAt: string;
};

export const useAgentFeed = ({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) => {
  const { user } = useAuthContext();
  const findingsQuery = useQuery({
    ...interestFindingsQueryOptions(id, user),
    enabled: enabled && !!user?.id && !!id,
  });
  const findings = findingsQuery.data ?? [];

  const items = findings.reduce<AgentFeedItem[]>((acc, finding) => {
    if (!finding.post) {
      return acc;
    }

    acc.push({
      id: finding.id,
      post: finding.post,
      score: finding.score,
      rationale: finding.rationale ?? '',
      createdAt: finding.createdAt,
    });

    return acc;
  }, []);

  return {
    items,
    isPending: findingsQuery.isPending,
    isFetching: findingsQuery.isFetching,
    refetch: findingsQuery.refetch,
  };
};
