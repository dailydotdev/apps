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

export type LazyModalType =
  | {
      type: LazyModal.NewSquad;
      props?: Partial<React.ComponentProps<typeof NewSquadModal>>;
    }
  | {
      type: LazyModal.SquadsBeta;
      props?: Partial<React.ComponentProps<typeof SquadsBetaModal>>;
    };

export const modals: Record<LazyModal, React.ComponentType<PropTypes>> = {
  [LazyModal.NewSquad]: NewSquadModal,
  [LazyModal.SquadsBeta]: SquadsBetaModal,
};
