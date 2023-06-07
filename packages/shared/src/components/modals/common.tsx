import React from 'react';
import dynamic from 'next/dynamic';
import { LazyModal } from './common/types';

export type CloseModalFunc = (
  e: React.MouseEvent | React.KeyboardEvent | React.FormEvent,
) => void;

const EditSquadModal = dynamic(
  () => import(/* webpackChunkName: "editSquadModal" */ './EditSquadModal'),
);
const PostToSquadModal = dynamic(
  () => import(/* webpackChunkName: "postToSquadModal" */ './PostToSquadModal'),
);
const NewSquadModal = dynamic(
  () => import(/* webpackChunkName: "newSquadModal" */ './NewSquadModal'),
);
const SquadMemberModal = dynamic(
  () => import(/* webpackChunkName: "squadMemberModal" */ './SquadMemberModal'),
);
const UpvotedPopupModal = dynamic(
  () =>
    import(/* webpackChunkName: "upvotedPopupModal" */ './UpvotedPopupModal'),
);
const SquadTourModal = dynamic(
  () => import(/* webpackChunkName: "squadTourModal" */ './SquadTourModal'),
);
const SquadPromotionModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadPromotionModal" */ './squads/SquadPromotionModal'
    ),
);

const EditWelcomePostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "editWelcomePostModal" */ './comment/EditWelcomePostModal'
    ),
);

const ReadingHistoryModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "readingHistoryModal" */ './post/ReadingHistoryModal'

const LegoReferralCampaignModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "legoReferralCampaignModal" */ './LegoReferralCampaignModal'
    ),
);

export const modals = {
  [LazyModal.NewSquad]: NewSquadModal,
  [LazyModal.EditSquad]: EditSquadModal,
  [LazyModal.PostToSquad]: PostToSquadModal,
  [LazyModal.SquadMember]: SquadMemberModal,
  [LazyModal.UpvotedPopup]: UpvotedPopupModal,
  [LazyModal.SquadTour]: SquadTourModal,
  [LazyModal.EditWelcomePost]: EditWelcomePostModal,
  [LazyModal.ReadingHistory]: ReadingHistoryModal,
  [LazyModal.SquadPromotion]: SquadPromotionModal,
  [LazyModal.LegoReferralCampaign]: LegoReferralCampaignModal,
};

type GetComponentProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;

export type ModalsType = typeof modals;

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

export type LazyModalType<T extends keyof ModalsType> = {
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
}[T];
