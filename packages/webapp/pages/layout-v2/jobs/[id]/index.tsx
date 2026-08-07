import JobPage, { getStaticPaths, getStaticProps } from '../../../jobs/[id]';
import { withLayoutVariant } from '../../../../lib/layoutVariantPage';

export { getStaticPaths, getStaticProps };
export default withLayoutVariant(JobPage, 'v2');
