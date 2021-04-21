import React, { ReactElement, ReactNode, useRef, useState } from 'react';
import { ModalCloseButton, ModalProps, StyledModal } from './StyledModal';
import Button from '../buttons/Button';
import ArrowIcon from '../../icons/arrow.svg';
import SearchField from '../fields/SearchField';
import { formToJson } from '../../lib/form';
import Loader from '../Loader';
import { useMutation } from 'react-query';
import { apiUrl } from '../../lib/config';
import fetchTimeout from '../../lib/fetchTimeout';
import classNames from 'classnames';
import request from 'graphql-request';
import {
  REQUEST_SOURCE_MUTATION,
  SOURCE_BY_FEED_QUERY,
} from '../../graphql/newSource';
import { Source } from '../../graphql/sources';
import Radio from '../fields/Radio';

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
  const [feeds, setFeeds] = useState<{ label: string; value: string }[]>();
  const [selectedFeed, setSelectedFeed] = useState<string>();
  const [existingSource, setExistingSource] = useState<Source>();

  const failedToScrape = () => {
    setShowContact(true);
    setScrapeError('Failed to fetch information');
  };

  const {
    mutateAsync: checkIfSourceExists,
    isLoading: checkingIfExists,
  } = useMutation<{ source: Source }, unknown, string>((feed: string) =>
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

  const {
    mutateAsync: requestSource,
    isLoading: requestingSource,
  } = useMutation<unknown, unknown, string>(
    (feed: string) =>
      request(`${apiUrl}/graphql`, REQUEST_SOURCE_MUTATION, {
        data: { sourceUrl: feed },
      }),
    {
      onSuccess: () => {
        ga('send', 'event', 'Request Source', 'Submit');
        props.onRequestClose?.(null);
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

  let children: ReactNode;
  if (existingSource) {
    children = (
      <div className="flex w-full mb-6 px-12 self-start items-center typo-callout">
        <img
          src={existingSource.image}
          alt={existingSource.name}
          className="w-8 h-8 rounded-lg"
        />
        <div className="ml-3 truncate">{existingSource.name}</div>
        <div className="ml-auto text-theme-label-tertiary">Already exists</div>
      </div>
    );
  } else if (feeds?.length > 0) {
    children = (
      <>
        <div className="typo-callout mb-6 text-theme-label-tertiary mx-10 self-start">
          {feeds.length} RSS feed{feeds.length > 1 ? 's' : ''} found
        </div>
        <form
          className="flex flex-col w-full items-center"
          onSubmit={onSubmitFeed}
        >
          <Radio
            name="rss"
            options={feeds}
            onChange={setSelectedFeed}
            value={selectedFeed}
            className="mx-10 self-start"
          />
          <div className="w-full h-px bg-theme-divider-secondary my-4" />
          <Button
            className="btn-primary mb-5"
            type="submit"
            disabled={!selectedFeed}
            loading={checkingIfExists || requestingSource}
          >
            Send for review
          </Button>
        </form>
      </>
    );
  } else {
    children = (
      <>
        <div
          id="new-source-field-desc"
          className={classNames(
            'typo-callout text-theme-status-error mx-10 self-start',
            !showContact && 'mb-6',
            !scrapeError && 'invisible',
          )}
        >
          {scrapeError || 'placeholder'}
        </div>
        {showContact && scrapeError && (
          <Button
            tag="a"
            className="btn-secondary small mt-3 mb-6 mx-10 self-start"
            href="mailto:hi@daily.dev?subject=Failed to add new source"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </Button>
        )}
      </>
    );
  }

  return (
    <StyledModal
      {...props}
      style={{ content: { paddingTop: '1.5rem', maxWidth: '27.5rem' } }}
    >
      <ModalCloseButton onClick={props.onRequestClose} />
      <h2 className="text-2xl font-bold">Add new source</h2>
      <p
        className="typo-callout text-theme-label-secondary text-center pt-1.5 pb-2"
        style={{ maxWidth: '18.75rem' }}
      >
        Have an idea for a new source? Insert its link below to add it to your
        feed.
      </p>
      <form
        className="flex flex-col w-full px-10"
        ref={scrapeFormRef}
        onSubmit={onScrapeSubmit}
        aria-busy={isScraping}
      >
        <SearchField
          className="my-4"
          inputId="new-source-field"
          name="url"
          placeholder="Paste blog / RSS URL"
          showIcon={false}
          type="url"
          autoFocus
          aria-describedby={scrapeError && 'new-source-field-desc'}
          valueChanged={onUrlChanged}
          rightChildren={
            <Button
              type="submit"
              className="btn-primary small"
              aria-label="Search feeds"
              disabled={!enableSubmission}
              icon={<ArrowIcon style={{ transform: 'rotate(90deg)' }} />}
            />
          }
        />
      </form>
      {children}
      {isScraping && <Loader className="absolute inset-x-0 bottom-5 mx-auto" />}
    </StyledModal>
  );
}
