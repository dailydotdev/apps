import React from 'react';
import dynamic from 'next/dynamic';
import { LazyModal } from './common/types';

export type CloseModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
) => void;

const SquadsBetaModal = dynamic(
  () => import(/* webpackChunkName: "squadsBetaModal" */ './SquadsBetaModal'),
);
const NewSquadModal = dynamic(
  () => import(/* webpackChunkName: "newSquadModal" */ './NewSquadModal'),
);

export type PropTypes = Partial<
  React.ComponentProps<typeof SquadsBetaModal | typeof NewSquadModal>
>;

export const modals = {
  [LazyModal.NewSquad]: NewSquadModal,
  [LazyModal.SquadsBeta]: SquadsBetaModal,
};

type ModalsType = typeof modals;
export type LazyModalType = {
  [K in keyof ModalsType]: {
    type: K;
    props?: Partial<React.ComponentProps<ModalsType[K]>>;
  };
}[keyof ModalsType];
