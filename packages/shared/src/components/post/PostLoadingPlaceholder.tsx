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
