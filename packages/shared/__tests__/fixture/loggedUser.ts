import { LoggedUser } from '../../src/lib/user';

const user: LoggedUser = {
  id: 'u1',
  username: 'ido',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: new Date().toISOString(),
  permalink: 'https://app.daily.dev/Ido',
};

export default user;
