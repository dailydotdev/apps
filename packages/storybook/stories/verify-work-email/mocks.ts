import { graphql, HttpResponse } from 'msw';
import { COMPANY } from './modal';

// The two mutations VerifyExperienceModal sends. Any code passes, and the
// company comes back linked, which production toasts as "Verification
// successful".
export const verifyHandlers = [
  graphql.mutation('AddUserCompany', () =>
    HttpResponse.json({ data: { addUserCompany: { _: null } } }),
  ),
  graphql.mutation('VerifyUserCompanyCode', ({ variables }) =>
    HttpResponse.json({
      data: {
        verifyUserCompanyCode: {
          email: variables.email,
          company: { id: 'acme', name: COMPANY.name, image: null },
        },
      },
    }),
  ),
];
