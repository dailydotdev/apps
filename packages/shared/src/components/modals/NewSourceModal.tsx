import React, { ReactElement, useContext, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import request from 'graphql-request';
import { Button } from '../buttons/Button';
import { SearchField } from '../fields/SearchField';
import { Radio } from '../fields/Radio';
import { formToJson } from '../../lib/form';
import { apiUrl } from '../../lib/config';
import fetchTimeout from '../../lib/fetchTimeout';
import { contentGuidelines } from '../../lib/constants';
import {
  REQUEST_SOURCE_MUTATION,
  SOURCE_BY_FEED_QUERY,
} from '../../graphql/newSource';
import { Source } from '../../graphql/sources';
import AuthContext from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { Modal, ModalProps } from './common/Modal';
import NotificationsContext from '../../contexts/NotificationsContext';
import PushNotificationModal from './PushNotificationModal';

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

export default function NewSourceModal(props: ModalProps): ReactElement {
  const scrapeFormRef = useRef<HTMLFormElement>();
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [scrapeError, setScrapeError] = useState<string>();
  const [showContact, setShowContact] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { hasPermissionCache, isNotificationSupported } =
    useContext(NotificationsContext);
  const [feeds, setFeeds] = useState<{ label: string; value: string }[]>();
  const [selectedFeed, setSelectedFeed] = useState<string>();
  const [existingSource, setExistingSource] = useState<Source>();
  const { user, loginState, showLogin } = useContext(AuthContext);
  const loginTrigger = AuthTriggers.SubmitNewSource;
  const { onRequestClose } = props;

  const failedToScrape = () => {
    setShowContact(true);
    setScrapeError('Failed to fetch information');
  };

  const { mutateAsync: checkIfSourceExists, isLoading: checkingIfExists } =
    useMutation<{ source: Source }, unknown, string>((feed: string) =>
      request(`${apiUrl}/graphql`, SOURCE_BY_FEED_QUERY, {
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
        if (data.type === 'website') {
          if (!data.rss.length) {
            setScrapeError('Could not find RSS feed');
          } else {
            setFeeds(
              data.rss.map((feed) => ({ label: feed.title, value: feed.url })),
            );
          }
        } else {
          failedToScrape();
        }
      },
      onError: failedToScrape,
    },
  );

  const { mutateAsync: requestSource, isLoading: requestingSource } =
    useMutation<unknown, unknown, string>(
      (feed: string) =>
        request(`${apiUrl}/graphql`, REQUEST_SOURCE_MUTATION, {
          data: { sourceUrl: feed },
        }),
      {
        onSuccess: () => {
          if (hasPermissionCache || !isNotificationSupported) {
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
      showLogin(loginTrigger);
      return;
    }

    const data = formToJson<{ url: string }>(e.currentTarget);
    await scrapeSource(data.url);
  };
  const onSubmitFeed = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const data = formToJson<{ rss: string }>(e.currentTarget);
    const res = await checkIfSourceExists(data.rss);
    if (res.source) {
      setExistingSource(res.source);
    } else {
      await requestSource(data.rss);
    }
  };
  const modalProps: ModalProps = {
    onRequestClose,
    ...props,
  };

  if (showNotification) {
    return <PushNotificationModal {...modalProps} />;
  }

  return (
    <Modal {...modalProps}>
      <Modal.Header title="Suggest new source" />
      <Modal.Body>
        <Modal.Text>
          Have an idea for a new source? Insert its link below to add it to the
          feed.
        </Modal.Text>
        <a
          className="mb-2 font-bold underline typo-callout text-theme-label-link"
          target="_blank"
          rel="noopener"
          href={contentGuidelines}
        >
          Content guidelines
        </a>
        <form
          className="flex flex-col w-full"
          ref={scrapeFormRef}
          onSubmit={onScrapeSubmit}
          aria-busy={isScraping}
          data-testid={`login state: ${loginState?.trigger}`}
          id="submit-source"
        >
          <SearchField
            disabled={!!feeds?.length}
            className="my-4"
            inputId="new-source-field"
            name="url"
            placeholder="Paste blog / RSS URL"
            showIcon={false}
            type="url"
            autoFocus
            aria-describedby={scrapeError && 'new-source-field-desc'}
            valueChanged={onUrlChanged}
            fieldType="primary"
            rightButtonProps={false}
          />
        </form>
        {!!existingSource && (
          <div className="flex items-center self-start px-12 mb-6 w-full typo-callout">
            <img
              src={existingSource.image}
              alt={existingSource.name}
              className="w-8 h-8 rounded-lg"
            />
            <div className="ml-3 truncate">{existingSource.name}</div>
            <div className="ml-auto text-theme-label-tertiary">
              Already exists
            </div>
          </div>
        )}
        {!!feeds?.length && (
          <>
            <div className="self-start mb-6 typo-callout text-theme-label-tertiary">
              {feeds.length} RSS feed{feeds.length > 1 ? 's' : ''} found
            </div>
            <form
              className="flex flex-col items-center w-full"
              id="select-feed"
              onSubmit={onSubmitFeed}
            >
              <Radio
                name="rss"
                options={feeds}
                onChange={setSelectedFeed}
                value={selectedFeed}
                className="self-start"
              />
            </form>
          </>
        )}
        {!existingSource && scrapeError && !feeds?.length && (
          <>
            <div
              id="new-source-field-desc"
              className={classNames(
                'typo-callout text-theme-status-error self-start',
                !showContact && 'mb-6',
              )}
            >
              {scrapeError}
            </div>
            {showContact && (
              <Button
                tag="a"
                className="self-start mt-3 mb-6 btn-secondary small"
                href="mailto:hi@daily.dev?subject=Failed to add new source"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </Button>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!feeds?.length && (
          <Button
            form="submit-source"
            className="btn-primary"
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
              className="btn-primary"
              type="submit"
              disabled={!selectedFeed}
              loading={checkingIfExists || requestingSource}
            >
              Submit for review
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
