import { gql } from 'graphql-request';
import { DevCardData } from '@dailydotdev/shared/src/hooks/profile/useDevCard';
import { DevCardType } from '@dailydotdev/shared/src/components/profile/devcard';

export type DevCard = {
  imageUrl: string;
};

export interface GenerateDevCardParams
  extends Pick<DevCardData, 'isProfileCover' | 'showBorder' | 'theme'> {
  type: DevCardType;
}

export const GENERATE_DEVCARD_MUTATION = gql`
  mutation GenerateDevCard(
    $theme: DevCardTheme
    $isProfileCover: Boolean
    $showBorder: Boolean
    $type: DevCardType
  ) {
    devCard: generateDevCardV2(
      theme: $theme
      isProfileCover: $isProfileCover
      showBorder: $showBorder
      type: $type
    ) {
      imageUrl
    }
  }
`;
