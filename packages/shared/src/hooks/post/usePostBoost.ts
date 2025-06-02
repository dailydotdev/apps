import { useQuery } from '@tanstack/react-query';

interface PostCampaign {
  id: string;
  title: string;
  description: string;
  cost: number;
  views: number;
  upvotes: number;
  comments: number;
}

interface UsePostBoost {
  data?: PostCampaign[];
  isLoading: boolean;
}

export const usePostBoost = (): UsePostBoost => {
  const { data, isPending } = useQuery<PostCampaign[]>({
    queryKey: ['postBoost'],
    // queryFn: async () => {
  });

  return { data, isLoading: isPending };
};
