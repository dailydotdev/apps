import type { ComponentType, ReactElement, ReactNode } from 'react';
import React from 'react';
import usePostById from '../../hooks/usePostById';
import type { Post } from '../../graphql/posts';

type WrappedComponentType<
  Props,
  LayoutProps = unknown,
> = ComponentType<Props> & {
  getLayout?: (
    page: ReactElement,
    pageProps?: Props,
    layoutProps?: LayoutProps,
  ) => ReactNode;
  layoutProps?: LayoutProps;
};

export const withPostById = <Props, LayoutProps = unknown>(
  WrappedComponent: WrappedComponentType<Props, LayoutProps>,
): WrappedComponentType<Props, LayoutProps> => {
  const WithPostById = (props: Props & { post?: Post }): ReactElement => {
    const { post: initialPost } = props;

    const { post: loadedPost } = usePostById({
      id: initialPost?.id,
    });
    const post = loadedPost ?? initialPost;

    if (!post?.id) {
      return null;
    }

    return <WrappedComponent {...props} post={post} />;
  };

  WithPostById.displayName = 'WithPostById';

  if (WrappedComponent.getLayout) {
    WithPostById.getLayout = WrappedComponent.getLayout;
  }

  if (WrappedComponent.layoutProps) {
    WithPostById.layoutProps = WrappedComponent.layoutProps;
  }

  return WithPostById;
};
