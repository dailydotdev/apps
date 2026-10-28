import nock from 'nock';
import { gqlRequest } from './common';

const QUERY = `query GenerateUniqueUsername($name: String!) {
  generateUniqueUsername(name: $name)
}`;

it('should not send the companion requestKey as a header', async () => {
  const name = 'יוסי כהן';
  nock('http://localhost:3000', { badheaders: ['requestKey'] })
    .post('/graphql')
    .reply(200, { data: { generateUniqueUsername: '' } });

  const res = await gqlRequest(
    QUERY,
    { name },
    { requestKey: JSON.stringify(['generateUsername', name]) },
  );

  expect(res).toEqual({ generateUniqueUsername: '' });
});
