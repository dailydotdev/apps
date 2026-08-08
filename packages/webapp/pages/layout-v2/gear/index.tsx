import GearPage, { getStaticProps } from '../../gear';
import { withLayoutVariant } from '../../../lib/layoutVariantPage';

export { getStaticProps };
export default withLayoutVariant(GearPage, 'v2');
