import { gql } from 'graphql-request';
import { DevCardData } from '@dailydotdev/shared/src/hooks/profile/useDevCard';
import { DevCardType } from '@dailydotdev/shared/src/components/profile/devcard';

export interface GenerateDevCardParams
  extends Pick<DevCardData, 'isProfileCover' | 'showBorder' | 'theme'> {
  type: DevCardType;
}

export interface DevCardMutation {
  devCard: { imageUrl: string };
}

export const GENERATE_DEVCARD_MUTATION = gql`
  mutation GenerateDevCard(
    $theme: DevCardTheme
    $type: DevCardType
    $isProfileCover: Boolean
    $showBorder: Boolean
  ) {
    devCard: generateDevCardV2(
      theme: $theme
      type: $type
      isProfileCover: $isProfileCover
      showBorder: $showBorder
    ) {
      imageUrl
    }
  }
`;
