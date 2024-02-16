import { Post, getReadPostButtonText } from '../../../graphql/posts';
import { useMedia } from '../../../hooks';
import { mobileL, mobileXL } from '../../../styles/media';

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

export const useReadPostButtonText = (post: Post): string | undefined => {
  const config = useMedia(
    queries,
    values,
    { transform: () => undefined },
    null,
  );

  return config?.transform?.(getReadPostButtonText(post));
};
