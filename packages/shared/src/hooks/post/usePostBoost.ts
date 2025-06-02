import { useQuery } from '@tanstack/react-query';

export interface PostCampaign {
  id: string;
  title: string;
  description?: string;
  image?: string; // Optional image URL
  cost: number;
  views: number;
  upvotes: number;
  comments: number;
  boostedUntil?: Date; // Optional date when the boost ends
  status: 'completed' | 'cancelled' | 'active';
}

interface UsePostBoost {
  data?: PostCampaign[];
  isLoading: boolean;
}

const dummyData = [
  {
    id: '1',
    title: 'Boost Your Post',
    description: 'Get more visibility for your posts',
    cost: 100,
    views: 5000,
    upvotes: 300,
    comments: 50,
  },
  {
    id: '2',
    title: 'Promote Your Content',
    description: 'Reach a wider audience with our promotion tools',
    cost: 200,
    views: 10000,
    upvotes: 600,
    comments: 80,
  },
];

export const usePostBoost = (): UsePostBoost => {
  const { data, isPending } = useQuery<PostCampaign[]>({
    queryKey: ['postBoost'],
    // queryFn: async () => {
  });

  return { data, isLoading: isPending };
};
