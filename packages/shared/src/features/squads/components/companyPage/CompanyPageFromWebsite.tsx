import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { LoggedUser } from '../../../../lib/user';
import type { CompanyPageRequest } from '../../../../graphql/squads';
import {
  claimCompanyPageRequest,
  CompanyPageRequestStatus,
  getCompanyPageRequest,
  requestCompanyPage,
} from '../../../../graphql/squads';
import type { ApiErrorResult } from '../../../../graphql/common';
import { DEFAULT_ERROR } from '../../../../graphql/common';
import { AuthTriggers } from '../../../../lib/auth';
import { parseHttpUrl } from '../../../../lib/links';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { storageWrapper } from '../../../../lib/storageWrapper';
import { StartupsHotjarEvent, trackHotjarEvent } from '../../../../lib/hotjar';
import { getStartupsCheckoutUrl } from '../../lib/routes';
import { isSquadPlan, SquadPlan } from '../../lib/plans';
import { AccountStep } from '../checkout/StartupsCheckout';
import { MangeSquadPageSkeleton } from '../../../../components/squads/MangeSquadPageSkeleton';
import { CompanyPageWebsiteStep } from './CompanyPageWebsiteStep';
import { CompanyPageBuilding } from './CompanyPageBuilding';
import type { CompanyPagePrefill } from './CompanyPageCreate';
import { CompanyPageCreate } from './CompanyPageCreate';

// The request survives the sign-up, which can leave the page (Google, GitHub)
export const COMPANY_PAGE_REQUEST_KEY = 'company_page_request';
const POLL_MS = 2000;
// Reading a site takes seconds; past this the founder gets the form instead
// of a spinner that never ends
export const BUILDING_TIMEOUT_MS = 90 * 1000;

interface StoredRequest {
  id: string;
  website: string;
}

const readStoredRequest = (): StoredRequest | null => {
  try {
    const value = storageWrapper.getItem(COMPANY_PAGE_REQUEST_KEY);
    return value ? (JSON.parse(value) as StoredRequest) : null;
  } catch {
    return null;
  }
};

const storeRequest = (request: StoredRequest | null): void => {
  try {
    if (request) {
      storageWrapper.setItem(
        COMPANY_PAGE_REQUEST_KEY,
        JSON.stringify({ id: request.id, website: request.website }),
      );
    } else {
      storageWrapper.removeItem(COMPANY_PAGE_REQUEST_KEY);
    }
  } catch {
    // Storage blocked: the request still works until the page is left
  }
};

const claimCompanyPageRequestQueryOptions = (
  user: LoggedUser | undefined,
  id?: string,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.CompanyPageRequest, user, 'claim', {
      id,
    }),
    queryFn: () => claimCompanyPageRequest(id as string),
    retry: false,
    staleTime: Infinity,
  });

const companyPageRequestQueryOptions = (
  user: LoggedUser | undefined,
  id?: string,
) =>
  queryOptions({
    queryKey: generateQueryKey(RequestKey.CompanyPageRequest, user, { id }),
    queryFn: () => getCompanyPageRequest(id as string),
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === CompanyPageRequestStatus.Pending ||
        status === CompanyPageRequestStatus.Ready
        ? POLL_MS
        : false;
    },
  });

const getHost = (website: string): string | undefined => {
  const url = parseHttpUrl(website.trim());
  return url ? new URL(url).hostname.replace(/^www\./, '') : undefined;
};

const getErrorMessage = (error: unknown): string =>
  (error as ApiErrorResult)?.response?.errors?.[0]?.message ?? DEFAULT_ERROR;

const toPrefill = (
  website: string,
  request?: CompanyPageRequest,
): CompanyPagePrefill => ({
  website: request?.website ?? website,
  name: request?.name,
  handle: request?.handle,
  description: request?.description,
});

/**
 * /squads/new?company=1: the founder enters their website, signs up while
 * daily-api reads it, and lands on the company page it created. The form is
 * the fallback, when the site can't be read or the founder has no website.
 * The /startups/ landing page sends the website it took in `?website=`.
 */
export const CompanyPageFromWebsite = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const queryWebsite =
    typeof router.query.website === 'string' ? router.query.website : '';
  const [website, setWebsite] = useState(queryWebsite);
  const [stored, setStored] = useState<StoredRequest | null>(readStoredRequest);
  const [fallback, setFallback] = useState<CompanyPagePrefill | null>(null);
  const [error, setError] = useState<string>();
  const startedFromQuery = useRef(false);

  const forget = useCallback(() => {
    storeRequest(null);
    setStored(null);
  }, []);

  const { mutate: request, isPending: isRequesting } = useMutation({
    mutationFn: requestCompanyPage,
    onSuccess: (created) => {
      storeRequest(created);
      setStored(created);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const submit = useCallback(
    (url: string) => {
      setError(undefined);
      // Back from a sign-up with the same site: keep the request it made
      if (stored && getHost(stored.website) === getHost(url)) {
        return;
      }

      request(url);
    },
    [request, stored],
  );

  // The landing page's box: start reading right away
  useEffect(() => {
    if (!isAuthReady || !queryWebsite || startedFromQuery.current) {
      return;
    }

    startedFromQuery.current = true;
    const url = parseHttpUrl(queryWebsite.trim());
    if (url) {
      submit(url);
    }
  }, [isAuthReady, queryWebsite, submit]);

  // A founder who logs in to an existing account takes the request made
  // before it; a new account already took it on sign-up
  const { isSuccess: isClaimed, isError: isClaimMissing } = useQuery({
    ...claimCompanyPageRequestQueryOptions(user, stored?.id),
    enabled: !!user && !!stored && !fallback,
  });

  const { data: pageRequest, isError: isReadMissing } = useQuery({
    ...companyPageRequestQueryOptions(user, stored?.id),
    enabled: isClaimed && !fallback,
  });
  const isRequestMissing = isClaimMissing || isReadMissing;

  // Someone else's request in this browser, or one that expired
  useEffect(() => {
    if (isRequestMissing) {
      forget();
    }
  }, [isRequestMissing, forget]);

  useEffect(() => {
    if (!pageRequest) {
      return;
    }

    if (
      pageRequest.status === CompanyPageRequestStatus.Created &&
      pageRequest.source
    ) {
      forget();
      trackHotjarEvent(StartupsHotjarEvent.CompanyPageCreated);
      router.replace(
        router.query.checkout === '1'
          ? getStartupsCheckoutUrl({
              plan: isSquadPlan(router.query.plan)
                ? router.query.plan
                : SquadPlan.Starter,
              sourceId: pageRequest.source.id,
            })
          : pageRequest.source.permalink,
      );
      return;
    }

    if (pageRequest.status === CompanyPageRequestStatus.Failed) {
      forget();
      setFallback(toPrefill(website, pageRequest));
    }
  }, [pageRequest, forget, router, website]);

  // Still reading after a long while: hand the founder the form
  const isBuilding = !!user && !!stored && !fallback;
  useEffect(() => {
    if (!isBuilding) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      forget();
      setFallback(toPrefill(website, pageRequest));
    }, BUILDING_TIMEOUT_MS);

    return () => clearTimeout(timeout);
    // Only the start of the wait counts, not every poll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBuilding]);

  if (!isAuthReady) {
    return <MangeSquadPageSkeleton />;
  }

  if (fallback) {
    return <CompanyPageCreate prefill={fallback} />;
  }

  if (!stored) {
    return (
      <CompanyPageWebsiteStep
        website={website}
        onWebsiteChange={setWebsite}
        onSubmit={submit}
        onFillManually={() => setFallback({})}
        isLoading={isRequesting}
        error={error}
      />
    );
  }

  if (!user) {
    const host = getHost(stored.website) ?? stored.website;

    return (
      <AccountStep
        trigger={AuthTriggers.CompanyPage}
        signUpTitle="Your page is on its way"
        signUpDescription={`Sign up while we pull your logo and description from ${host}.`}
        logInDescription={`Log in while we pull your logo and description from ${host}.`}
      />
    );
  }

  return <CompanyPageBuilding website={stored.website} />;
};
