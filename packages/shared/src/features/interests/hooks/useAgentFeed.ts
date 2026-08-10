import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { interestFindingsQueryOptions } from '../queries';
import { mockFeedItems } from '../mockFeed';

export type AgentFeedItem = {
  id: string;
  post: Post;
  score: number;
  rationale: string;
  createdAt: string;
};

export const useAgentFeed = ({
  id,
  forceDemo,
  enabled = true,
}: {
  id: string;
  forceDemo: boolean;
  enabled?: boolean;
}) => {
  const { user } = useAuthContext();
  const findingsQuery = useQuery({
    ...interestFindingsQueryOptions(id, user),
    enabled: enabled && !!user?.id && !!id && !forceDemo,
  });
  const findings = findingsQuery.data ?? [];
  // MOCK-UP ONLY: a real agent that has legitimately found nothing yet is
  // indistinguishable from the design surface here, so it gets served fabricated
  // findings. This must be narrowed to `forceDemo` alone before the flag ramps
  // to anyone outside the team, or readers will be shown posts their agent never
  // saw.
  const isDemo =
    forceDemo || (!findingsQuery.isPending && findings.length === 0);

  const realItems = findings.reduce<AgentFeedItem[]>((acc, finding) => {
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
  const items: AgentFeedItem[] = isDemo ? mockFeedItems : realItems;

  return {
    items,
    isDemo,
    isPending: isDemo ? false : findingsQuery.isPending,
    isFetching: isDemo ? false : findingsQuery.isFetching,
    refetch: findingsQuery.refetch,
  };
};
