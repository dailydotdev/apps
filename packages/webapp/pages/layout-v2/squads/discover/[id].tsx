import SquadCategoryPage, {
  getServerSideProps,
} from '../../../squads/discover/[id]';
import { withLayoutVariant } from '../../../../lib/layoutVariantPage';

export { getServerSideProps };
export default withLayoutVariant(SquadCategoryPage, 'v2');
