import React, { ComponentType, ReactElement, ReactNode } from 'react';
import usePostById from '../../hooks/usePostById';
import { Post } from '../../graphql/posts';

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
    const { post } = props;

    const { post: loadedPost, isLoading } = usePostById({
      id: post?.id,
      options: { initialData: { post } },
    });

    if (!post.id || isLoading) {
      return null;
    }

    return <WrappedComponent {...props} post={loadedPost} />;
  };

  WithPostById.displayName = 'WithFeaturesBoundary';

  if (WrappedComponent.getLayout) {
    WithPostById.getLayout = WrappedComponent.getLayout;
  }

  if (WrappedComponent.layoutProps) {
    WithPostById.layoutProps = WrappedComponent.layoutProps;
  }

  return WithPostById;
};
