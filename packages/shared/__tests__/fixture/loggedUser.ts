import { LoggedUser } from '../../src/lib/user';
import { Author } from '../../src/graphql/comments';

const user: LoggedUser = {
  id: 'u1',
  username: 'ido',
  bio: 'Software Engineer in the most amazing company in the globe',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: new Date().toISOString(),
  permalink: 'https://app.daily.dev/Ido',
};

const { id, username, name, image, permalink } = user;
export const author: Author = {
  id,
  username,
  name,
  image,
  permalink,
};

export default user;
