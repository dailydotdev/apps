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
  link: string;
  boostedUntil?: Date; // Optional date when the boost ends
  createdAt: Date;
  status: 'completed' | 'cancelled' | 'active';
}

// interface PostCampaign {
//   id: string;
//   cost: number;
//   boostedUntil?: Date; // Optional date when the boost ends
//   createdAt: Date;
//   status: 'completed' | 'cancelled' | 'active';
//   post: {
//     permalink: string;
//     title: string;
//     content: string;
//     titleHtml: string;
//     contentHtml: string;
//     image: string;
//     numUpvotes: number;
//     numComments: number;
//     views: number;
//     tags: string[];
//     createdAt: Date;
//     readTime: number;
//     author: {
//       id: string;
//       name: string;
//       image: string;
//     };
//     sharedPost: {
//       id: string;
//       title: string;
//       content: string;
//       image: string;
//     };
//   };
// }

interface UsePostBoost {
  data?: PostCampaign[];
  isLoading: boolean;
}

const dummyData: PostCampaign[] = [
  {
    id: '1',
    title: 'Boost Your Post',
    description: 'Get more visibility for your posts',
    cost: 100,
    views: 5000,
    upvotes: 300,
    comments: 50,
    link: 'https://example.com/boost-your-post',
    boostedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Boost lasts for 7 days
    status: 'active',
    image: 'https://example.com/image1.jpg', // Example image URL
    createdAt: new Date(), // Current date
  },
  {
    id: '2',
    title: 'Promote Your Content',
    description: 'Reach a wider audience with our promotion tools',
    cost: 200,
    views: 10000,
    upvotes: 600,
    comments: 80,
    link: 'https://example.com/promote-your-content',
    boostedUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Boost lasts for 5 days
    status: 'completed',
    image: 'https://example.com/image2.jpg', // Example image URL
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Created 3 days ago
  },
];

export const usePostBoost = (): UsePostBoost => {
  const { data, isPending, isFetched } = useQuery<PostCampaign[]>({
    queryKey: ['postBoost'],
    // queryFn: async () => {
    initialData: dummyData,
  });

  return { data, isLoading: isPending && !isFetched };
};
