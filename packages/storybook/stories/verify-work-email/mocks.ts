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


/** The email is refused, e.g. a personal address: the generic error toast. */
export const emailRejectedHandlers = [
  graphql.mutation('AddUserCompany', () =>
    HttpResponse.json({ errors: [{ message: 'Something went wrong' }] }),
  ),
  verifyHandlers[1],
];

/** The code is wrong or expired: the generic error toast. */
export const wrongCodeHandlers = [
  verifyHandlers[0],
  graphql.mutation('VerifyUserCompanyCode', () =>
    HttpResponse.json({ errors: [{ message: 'Something went wrong' }] }),
  ),
];

/**
 * A company we don't have yet: no company comes back, and production toasts
 * "Verification initiated" while the team reviews it.
 */
export const pendingReviewHandlers = [
  verifyHandlers[0],
  graphql.mutation('VerifyUserCompanyCode', ({ variables }) =>
    HttpResponse.json({
      data: {
        verifyUserCompanyCode: { email: variables.email, company: null },
      },
    }),
  ),
];
