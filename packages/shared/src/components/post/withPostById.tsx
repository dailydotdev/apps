import React, { ComponentType } from 'react';
import usePostById from '../../hooks/usePostById';

type WrappedComponentType<Props> = ComponentType<Props>;

export const withPostById = (WrappedComponent) => {
  return (props) => {
    const { post } = props;

    if (!post.id) {
      return null;
    }

    const { post: loadedPost, isLoading } = usePostById({
      id: post.id,
      options: { initialData: { post } },
    });
    console.log('loaded', loadedPost, isLoading);
    if (isLoading) {
      return null;
    }

    return <WrappedComponent {...props} post={loadedPost} />;
  };
};
