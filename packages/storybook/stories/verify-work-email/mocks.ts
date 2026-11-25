import { graphql, HttpResponse } from 'msw';
import { COMPANY } from './modal';

// The two mutations VerifyExperienceModal sends. Any code passes. A known
// company comes back linked, which production toasts as "Verification
// successful"; a new one comes back without a company, "Verification
// initiated", while it waits for review.
const verifyHandlers = (isKnownCompany: boolean) => [
  graphql.mutation('AddUserCompany', () =>
    HttpResponse.json({ data: { addUserCompany: { _: null } } }),
  ),
  graphql.mutation('VerifyUserCompanyCode', ({ variables }) =>
    HttpResponse.json({
      data: {
        verifyUserCompanyCode: {
          email: variables.email,
          company: isKnownCompany
            ? { id: 'acme', name: COMPANY.name, image: null }
            : null,
        },
      },
    }),
  ),
];

export const knownCompanyHandlers = verifyHandlers(true);
export const newCompanyHandlers = verifyHandlers(false);
