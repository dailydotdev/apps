import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import {
  getLegacySquadRedirect,
  LegacySquadRedirectPage,
} from '../../../components/squads/SquadRoute';

export const getServerSideProps = getLegacySquadRedirect(
  SquadManageSection.Analytics,
);

export default LegacySquadRedirectPage;
