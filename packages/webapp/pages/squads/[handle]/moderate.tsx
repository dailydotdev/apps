import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import {
  getLegacySquadRedirect,
  LegacySquadRedirectPage,
} from '../../../components/squads/SquadRoute';

// Moderators land on the queue; authors are sent on to their Pending posts.
export const getServerSideProps = getLegacySquadRedirect(
  SquadManageSection.Moderation,
);

export default LegacySquadRedirectPage;
