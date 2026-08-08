import StandupPage, { getServerSideProps } from '../../standups/[id]';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getServerSideProps };
export default withLayoutVariant(StandupPage, 'v2');
