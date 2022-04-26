import React, { ReactElement, ReactNode } from 'react';
import { UserItemPlaceholder } from '../widgets/UserItemPlaceholder';
import { PageWidgets } from '../utilities';
import {
  PlaceholderSeparator,
  TextPlaceholder,
  WidgetContainer,
} from '../widgets/common';
import { ListItemPlaceholder } from '../widgets/ListItemPlaceholder';
import PlaceholderCommentList from '../comments/PlaceholderCommentList';
import { ElementPlaceholder } from '../ElementPlaceholder';

const LoadingPlaceholderContainer = ({
  children,
}: {
  children?: ReactNode;
}) => (
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

export const PostLoadingPlaceholder = (): ReactElement => {
  return (
    <>
      <div className="flex flex-col flex-1 p-8 tablet:border-r laptop:w-[40.75rem] laptop:max-w-[40.75rem] tablet:border-theme-divider-tertiary">
        <ElementPlaceholder className="my-2 mb-8 w-3/5 h-8 rounded-full" />
        <ListItemPlaceholder padding="p-0 gap-2" textClassName="h-4" />
        <div className="flex flex-row gap-2 my-8">
          <ElementPlaceholder className="w-20 h-6 rounded-full" />
          <ElementPlaceholder className="w-20 h-6 rounded-full" />
        </div>
        <ElementPlaceholder className="w-4/5 h-52 rounded-16" />
        <ElementPlaceholder className="my-8 w-2/5 h-8 rounded-full" />
        <PlaceholderSeparator />
        <PlaceholderCommentList />
      </div>
      <PageWidgets className="flex-1 p-8">
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
    </>
  );
};
