import React, {
  ReactElement,
  ReactNode,
  useContext,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Radio } from '../fields/Radio';
import { formToJson } from '../../lib/form';
import { apiUrl } from '../../lib/config';
import fetchTimeout from '../../lib/fetchTimeout';
import { contentGuidelines } from '../../lib/constants';
import {
  REQUEST_SOURCE_MUTATION,
  SOURCE_BY_FEED_QUERY,
  SOURCE_REQUEST_AVAILABILITY_QUERY,
  SourceRequestAvailability,
} from '../../graphql/newSource';
import { Source } from '../../graphql/sources';
import AuthContext from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { Modal, ModalProps } from './common/Modal';
import PushNotificationModal from './PushNotificationModal';
import usePersistentContext from '../../hooks/usePersistentContext';
import Alert, { AlertType } from '../widgets/Alert';
import SourceProfilePicture from '../profile/SourceProfilePicture';
import { LinkIcon, LockIcon, OpenLinkIcon } from '../icons';
import {
  DISMISS_PERMISSION_BANNER,
  usePushNotificationMutation,
} from '../../hooks/notifications';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { TextField } from '../fields/TextField';
import { ReputationAlert } from './ReputationAlert';
import { RequestKey } from '../../lib/query';
import { ProfileImageSize } from '../ProfilePicture';
import { gqlClient } from '../../graphql/common';

interface RSS {
  url: string;
  title: string;
}

interface ScrapeSourceWebsite {
  type: 'website';
  website?: string;
  rss: RSS[];
  logo?: string;
  name?: string;
}

interface ScrapeSourceRSS {
  type: 'rss';
  rss: string;
  website: string;
}

interface ScrapeSourceUnavailable {
  type: 'unavailable';
}

type ScrapeSourceResponse =
  | ScrapeSourceWebsite
  | ScrapeSourceRSS
  | ScrapeSourceUnavailable;

const getFeedLabel = (label: string, link: string) => (
  <span className="flex w-full flex-1 items-center justify-between">
    {label}
    <Button
      variant={ButtonVariant.Tertiary}
      tag="a"
      target="_blank"
      href={link}
      icon={<OpenLinkIcon />}
    />
  </span>
);

export default function NewSourceModal(props: ModalProps): ReactElement {
  const scrapeFormRef = useRef<HTMLFormElement>();
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [scrapeError, setScrapeError] = useState<string>();
  const [showContact, setShowContact] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { isPushSupported } = usePushNotificationContext();
  const { hasPermissionCache } = usePushNotificationMutation();
  const [feeds, setFeeds] = useState<{ label: ReactNode; value: string }[]>();
  const [selectedFeed, setSelectedFeed] = useState<string>();
  const [existingSource, setExistingSource] = useState<Source>();
  const { user, isLoggedIn, loginState, showLogin } = useContext(AuthContext);
  const loginTrigger = AuthTriggers.SubmitNewSource;
  const { onRequestClose } = props;
  const [isDismissed, setIsDismissed] = usePersistentContext(
    DISMISS_PERMISSION_BANNER,
    false,
  );
  const { data: sourceRequestAvailability, isLoading: isLoadingAccess } =
    useQuery([RequestKey.SourceRequestAvailability, user?.id], async () => {
      const result = await gqlClient.request<{
        sourceRequestAvailability: SourceRequestAvailability;
      }>(SOURCE_REQUEST_AVAILABILITY_QUERY);

      return result.sourceRequestAvailability;
    });

  const failedToScrape = () => {
    setShowContact(true);
    setScrapeError(
      'Failed to fetch information, try to find the link to the RSS itself and try again.',
    );
  };

  const { mutateAsync: checkIfSourceExists, isLoading: checkingIfExists } =
    useMutation<{ source: Source }, unknown, string>((feed: string) =>
      gqlClient.request(SOURCE_BY_FEED_QUERY, {
        feed,
      }),
    );

  const { mutateAsync: scrapeSource, isLoading: isScraping } = useMutation<
    ScrapeSourceResponse,
    unknown,
    string
  >(
    async (url) => {
      const res = await fetchTimeout(
        `${apiUrl}/scrape/source?url=${url}`,
        20000,
        {
          credentials: 'same-origin',
        },
      );
      return res.json();
    },
    {
      onMutate: () => {
        setScrapeError(null);
        setShowContact(false);
        setFeeds(null);
        setSelectedFeed(null);
        setExistingSource(null);
      },
      onSuccess: (data) => {
        if (data.type !== 'website') {
          return failedToScrape();
        }

        if (!data.rss.length) {
          return setScrapeError('Could not find RSS feed');
        }

        return setFeeds(
          data.rss.map((feed) => ({
            label: getFeedLabel(feed.title, feed.url),
            value: feed.url,
          })),
        );
      },
      onError: failedToScrape,
    },
  );

  const { mutateAsync: requestSource, isLoading: requestingSource } =
    useMutation<unknown, unknown, string>(
      (feed: string) =>
        gqlClient.request(REQUEST_SOURCE_MUTATION, {
          data: { sourceUrl: feed },
        }),
      {
        onSuccess: () => {
          if (hasPermissionCache || !isPushSupported || isDismissed) {
            onRequestClose?.(null);
            return;
          }
          setShowNotification(true);
        },
      },
    );

  const onUrlChanged = () => {
    if (scrapeFormRef.current) {
      setEnableSubmission(scrapeFormRef.current.checkValidity());
    }
  };

  const onScrapeSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!user) {
      showLogin({ trigger: loginTrigger });
      return;
    }

    const data = formToJson<{ url: string }>(e.currentTarget);
    await scrapeSource(data.url);
  };
  const onSubmitFeed = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (existingSource) {
      return;
    }

    const data = formToJson<{ rss: string }>(e.currentTarget);
    const res = await checkIfSourceExists(data.rss);
    if (res.source) {
      setExistingSource(res.source);
    } else {
      await requestSource(data.rss);
    }
  };

  const onNotificationClose = async (e: React.MouseEvent) => {
    await setIsDismissed(true);
    onRequestClose(e);
  };

  const modalProps: ModalProps = {
    onRequestClose: onNotificationClose,
    ...props,
  };

  if (isLoadingAccess) {
    return null;
  }

  const isEnabled = isLoggedIn && sourceRequestAvailability.hasAccess;

  if (showNotification) {
    return <PushNotificationModal {...modalProps} />;
  }

  const linkHasFeed = !!feeds?.length;

  return (
    <Modal
      {...modalProps}
      formProps={{
        title: 'Suggest new source',
        form: linkHasFeed ? 'select-feed' : 'submit-source',
        copy: { right: linkHasFeed ? 'Submit for review' : 'Check link' },
        rightButtonProps: {
          disabled: linkHasFeed
            ? !selectedFeed || !!existingSource
            : !enableSubmission || !isEnabled,
          loading: linkHasFeed
            ? checkingIfExists || requestingSource
            : isScraping,
        },
      }}
    >
      <Modal.Header title="Suggest new source" />
      <Modal.Body>
        <Modal.Text>
          Have an idea for a new source? Insert its link below to add it to the
          feed.
        </Modal.Text>
        <a
          className="mb-2 font-bold text-text-link underline typo-callout"
          target="_blank"
          rel="noopener"
          href={contentGuidelines}
        >
          Content guidelines
        </a>
        <form
          className="flex w-full flex-col"
          ref={scrapeFormRef}
          onSubmit={onScrapeSubmit}
          aria-busy={isScraping}
          data-testid={`login state: ${loginState?.trigger}`}
          id="submit-source"
        >
          <TextField
            disabled={!isEnabled || !!feeds?.length}
            className={{
              container: 'mt-4',
            }}
            inputId="new-source-field"
            name="url"
            label="Paste blog / RSS URL"
            placeholder="Paste blog / RSS URL"
            autoComplete="off"
            type="url"
            autoFocus
            aria-describedby={scrapeError && 'new-source-field-desc'}
            valueChanged={onUrlChanged}
            fieldType="primary"
            leftIcon={<LinkIcon />}
            rightIcon={
              !isEnabled ? (
                <LockIcon className="text-text-disabled" />
              ) : undefined
            }
          />
        </form>
        {isEnabled && existingSource && (
          <Alert
            className="mt-4"
            type={AlertType.Error}
            title={
              <>
                {existingSource.name} already exist{' '}
                <SourceProfilePicture
                  className="ml-auto"
                  source={existingSource}
                  size={ProfileImageSize.Small}
                />
              </>
            }
          />
        )}
        {!isEnabled && <ReputationAlert className="mt-4" />}
        {isEnabled && (
          <>
            {!!feeds?.length && !existingSource && (
              <>
                <div className="mb-6 self-start text-text-tertiary typo-callout">
                  {feeds.length} RSS feed{feeds.length > 1 ? 's' : ''} found
                </div>
                <form
                  className="flex w-full flex-col items-center"
                  id="select-feed"
                  onSubmit={onSubmitFeed}
                >
                  <Radio
                    name="rss"
                    options={feeds}
                    onChange={setSelectedFeed}
                    value={selectedFeed}
                    className={{
                      container: 'w-full self-start',
                      content: 'w-full pr-0',
                    }}
                  />
                </form>
              </>
            )}
            {!existingSource && scrapeError && !feeds?.length && (
              <>
                <div
                  id="new-source-field-desc"
                  className={classNames(
                    'self-start text-status-error typo-callout',
                    !showContact && 'mb-6',
                  )}
                >
                  {scrapeError}
                </div>
                {showContact && (
                  <Button
                    tag="a"
                    className="mb-6 mt-3 self-start"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    href="mailto:hi@daily.dev?subject=Failed to add new source"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </Modal.Body>
      {isEnabled && (
        <Modal.Footer>
          {!feeds?.length && (
            <Button
              form="submit-source"
              variant={ButtonVariant.Primary}
              type="submit"
              disabled={isScraping || !enableSubmission}
              loading={isScraping}
            >
              Check link
            </Button>
          )}
          {!!feeds?.length && (
            <>
              <Button
                className="mr-auto"
                disabled={checkingIfExists || requestingSource}
                onClick={() => {
                  setFeeds([]);
                }}
              >
                Back
              </Button>
              <Button
                form="select-feed"
                variant={ButtonVariant.Primary}
                type="submit"
                disabled={!selectedFeed || !!existingSource}
                loading={checkingIfExists || requestingSource}
              >
                Submit for review
              </Button>
            </>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
}
