import ProfilePage from './index';

// The profile's About segment on a phone. It is the profile page itself with
// that segment open; wider screens show the whole profile here, and the SEO
// defaults canonicalize it to /<username>.
export { getStaticProps, getStaticPaths } from './index';

export default ProfilePage;
