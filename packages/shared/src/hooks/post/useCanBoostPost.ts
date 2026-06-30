import type { Post } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCanPurchaseCores } from '../useCoresFeature';

export const checkCanBoostByUser = (post: Post, userId: string) =>
  (post?.author?.id && post?.author?.id === userId) ||
  (post?.scout?.id && post?.scout?.id === userId);

export const useCanBoostPost = (post: Post) => {
  const { user } = useAuthContext();
  const canBuy = useCanPurchaseCores();

  if (!user?.id) {
    return { canBoost: false };
  }

  const canBoost =
    canBuy && checkCanBoostByUser(post, user.id) && !post?.private;

  return { canBoost };
};
