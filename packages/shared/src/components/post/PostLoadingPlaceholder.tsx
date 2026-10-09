import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { UserItemPlaceholder } from '../widgets/UserItemPlaceholder';
import { PageWidgets } from '../utilities';
import {
  BodyTextPlaceholder,
  PlaceholderSeparator,
  TextPlaceholder,
  TitleTextPlaceholder,
  WidgetContainer,
} from '../widgets/common';
import { ListItemPlaceholder } from '../widgets/ListItemPlaceholder';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';

const Container = classed('div', 'flex flex-col flex-1 p-8');

interface LoadingPlaceholderContainerProps {
  children?: ReactNode;
}

const LoadingPlaceholderContainer = ({
  children,
}: LoadingPlaceholderContainerProps) => (
  <WidgetContainer>
    <TextPlaceholder className="my-4 ml-6 w-2/5" />
    <PlaceholderSeparator />
    {children}
    <PlaceholderSeparator />
    <TextPlaceholder
      className="my-4 ml-6 w-2/5"
      style={{ height: '1.25rem' }}
    />
  </WidgetContainer>
);

interface PostLoadingPlaceholderProps extends LoadingPlaceholderContainerProps {
  shouldShowWidgets?: boolean;
  className?: string;
}

// The phone post page in its own order: source line, title, TLDR, tags,
// metadata, cover. The capsule and the comments wait for the post.
export const PhonePostLoadingPlaceholder = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div
    aria-busy
    aria-label="Loading post"
    className={classNames('flex flex-col px-4 py-6', className)}
  >
    <TextPlaceholder className="w-24" />
    <TitleTextPlaceholder className="mt-4 w-3/4" />
    <TitleTextPlaceholder className="mt-2 w-1/2" />
    <BodyTextPlaceholder className="mt-6 w-full" />
    <BodyTextPlaceholder className="mt-2 w-full" />
    <BodyTextPlaceholder className="mt-2 w-2/3" />
    <div className="mt-6 flex gap-2">
      <ElementPlaceholder className="h-6 w-24 rounded-8" />
      <ElementPlaceholder className="h-6 w-28 rounded-8" />
      <ElementPlaceholder className="h-6 w-20 rounded-8" />
    </div>
    <TextPlaceholder className="mt-4 w-48" />
    <ElementPlaceholder className="mt-6 aspect-[100/49] w-full max-w-[25.625rem] rounded-16" />
    <div className="mt-6 flex gap-4">
      <TextPlaceholder className="w-20" />
      <TextPlaceholder className="w-24" />
      <TextPlaceholder className="w-24" />
    </div>
  </div>
);

export const PostLoadingPlaceholder = ({
  shouldShowWidgets = true,
  className,
}: PostLoadingPlaceholderProps): ReactElement => {
  return (
    <>
      <Container className={className}>
        <ElementPlaceholder className="my-2 mb-8 h-8 w-3/5 rounded-10" />
        <ListItemPlaceholder padding="p-0 gap-2" textClassName="h-4" />
        <div className="my-8 flex flex-row gap-2">
          <ElementPlaceholder className="h-6 w-20 rounded-10" />
          <ElementPlaceholder className="h-6 w-20 rounded-10" />
        </div>
        <ElementPlaceholder className="h-52 w-4/5 rounded-16" />
        <ElementPlaceholder className="my-8 h-8 w-2/5 rounded-10" />
        <PlaceholderSeparator />
        <PlaceholderCommentList />
      </Container>
      {shouldShowWidgets && (
        <PageWidgets className="flex-1 p-8">
          <TextPlaceholder />
          <LoadingPlaceholderContainer>
            <UserItemPlaceholder />
            <UserItemPlaceholder />
            <UserItemPlaceholder />
          </LoadingPlaceholderContainer>
          <LoadingPlaceholderContainer>
            <ListItemPlaceholder />
            <ListItemPlaceholder />
            <ListItemPlaceholder />
          </LoadingPlaceholderContainer>
        </PageWidgets>
      )}
    </>
  );
};
