import React from 'react';
import dynamic from 'next/dynamic';
import { LazyModal } from './common/types';

export type CloseModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
) => void;

const PostToSquadModal = dynamic(
  () => import(/* webpackChunkName: "postToSquadModal" */ './PostToSquadModal'),
);
const NewSquadModal = dynamic(
  () => import(/* webpackChunkName: "newSquadModal" */ './NewSquadModal'),
);

export const modals = {
  [LazyModal.NewSquad]: NewSquadModal,
  [LazyModal.PostToSquad]: PostToSquadModal,
};

type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;

type ModalsType = typeof modals;

export type LazyPropTypes = Partial<
  {
    [K in keyof ModalsType]: GetComponentProps<ModalsType[K]>;
  }[keyof ModalsType]
>;

type LazyModalComponentType<K extends LazyModal> = Omit<
  GetComponentProps<ModalsType[K]>,
  'isOpen' | 'onRequestClose'
>;

type RequiredKeys<T> = {
  [K in keyof T]: Record<string, never> extends { [P in K]: T[K] } ? never : K;
}[keyof T];

type NonOptional<T> = Pick<T, RequiredKeys<T>>;

export type LazyModalType = {
  [K in keyof ModalsType]: NonOptional<
    LazyModalComponentType<K>
  > extends Record<string, never>
    ? {
        type: K;
        props?: LazyModalComponentType<K>;
      }
    : {
        type: K;
        props: LazyModalComponentType<K>;
      };
}[keyof ModalsType];
