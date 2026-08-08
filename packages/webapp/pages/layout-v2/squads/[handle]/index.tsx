import SquadPage, { getServerSideProps } from '../../../squads/[handle]';
import { withLayoutVariant } from '../../../../lib/layoutVariantPage';

export { getServerSideProps };
export default withLayoutVariant(SquadPage, 'v2');
