import type { Post } from '../../../../graphql/posts';
import { getReadPostButtonText } from '../../../../graphql/posts';
import { useMedia } from '../../../../hooks';
import { mobileL, mobileXL } from '../../../../styles/media';
import { useFeature } from '../../../GrowthBookProvider';
import { visitLinkFeature } from '../../../../lib/featureManagement';

const queries = [mobileXL, mobileL].map((q) => q.replace('@media ', ''));

interface Value {
  transform: (text: string) => string | undefined;
}

const values: Value[] = [
  {
    transform: (text) => text,
  },
  {
    transform: (text) => text?.split(' ')?.[0],
  },
];

export const useVisitLink = ({ post }: { post: Post }): string => {
  const visitLink = useFeature(visitLinkFeature);

  return visitLink ? 'Visit link' : getReadPostButtonText(post);
};

export const useReadPostButtonText = (post: Post): string | undefined => {
  const config = useMedia(
    queries,
    values,
    { transform: () => undefined },
    null,
  );
  const copy = useVisitLink({ post });

  return config?.transform?.(copy);
};
