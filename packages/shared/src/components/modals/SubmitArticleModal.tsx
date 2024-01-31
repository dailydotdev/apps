import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import request from 'graphql-request';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import { formToJson } from '../../lib/form';
import { graphqlUrl } from '../../lib/config';
import {
  communityLinksGuidelines,
  contentGuidelinesLink,
} from '../../lib/constants';
import { TextField } from '../fields/TextField';
import AuthContext from '../../contexts/AuthContext';
import {
  SubmissionAvailability,
  SUBMISSION_AVAILABILITY_QUERY,
  SubmitArticleResponse,
  SUBMIT_ARTICLE_MUTATION,
} from '../../graphql/submitArticle';
import PostItemCard from '../post/PostItemCard';
import { PostItem } from '../../graphql/posts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { LinkIcon } from '../icons';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Modal, ModalProps } from './common/Modal';
import EnableNotification from '../notifications/EnableNotification';
import {
  AnalyticsEvent,
  FeedItemTitle,
  NotificationPromptSource,
} from '../../lib/analytics';
import { Justify } from '../utilities';

const defaultErrorMessage = 'Something went wrong, try again';

export default function SubmitArticleModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  const submitFormRef = useRef<HTMLFormElement>();
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingArticle, setExistingArticle] = useState<PostItem>(null);
  const [urlHint, setUrlHint] = useState<string>();
  const availabilityKey = ['submission_availability', user?.id];
  const { data: access, isFetched } = useQuery<{
    submissionAvailability: SubmissionAvailability;
  }>(availabilityKey, () => request(graphqlUrl, SUBMISSION_AVAILABILITY_QUERY));
  const { submissionAvailability } = access || {};
  const isEnabled = submissionAvailability?.hasAccess;
  const { mutateAsync: submitArticle } = useMutation<
    { submitArticle: SubmitArticleResponse },
    unknown,
    string
  >((articleUrl: string) =>
    request(graphqlUrl, SUBMIT_ARTICLE_MUTATION, {
      url: articleUrl,
    }),
  );

  const submitArticleFailEvent = (reason: string): void => {
    trackEvent({
      event_name: 'submit article fail',
      extra: JSON.stringify({
        reason,
      }),
    });
  };

  const onUrlChanged = () => {
    if (submitFormRef.current) {
      if (existingArticle) {
        setExistingArticle(null);
      }
      if (urlHint) {
        setUrlHint(null);
      }
      setEnableSubmission(submitFormRef.current.checkValidity());
    }
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const data = formToJson<{ articleUrl: string }>(event.currentTarget);

    setIsValidating(true);

    if (!data.articleUrl) {
      setUrlHint('Please submit a valid URL');
      setIsValidating(false);
      return;
    }

    trackEvent({
      event_name: 'submit article',
      feed_item_title: 'Submit article',
      extra: JSON.stringify({ url: data?.articleUrl }),
    });

    try {
      const res = await submitArticle(data.articleUrl);
      const {
        reason = defaultErrorMessage,
        post,
        submission,
      } = res.submitArticle;
      if (submission) {
        setIsSubmitted(true);
        const updated = { submissionAvailability };
        updated.submissionAvailability.todaySubmissionsCount += 1;
        client.setQueryData(availabilityKey, updated);
        trackEvent({ event_name: 'submit article succeed' });
      } else if (post) {
        setExistingArticle({ post });
        submitArticleFailEvent('Article exists already');
      } else if (reason) {
        setUrlHint(reason);
        submitArticleFailEvent(reason);
      }
    } catch (err) {
      setUrlHint(defaultErrorMessage);
      setEnableSubmission(false);
      submitArticleFailEvent(defaultErrorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const getAlert = () => {
    if (existingArticle) {
      return null;
    }

    if (!isEnabled) {
      return (
        <Alert
          className="mt-4"
          type={AlertType.Error}
          title="You do not have enough reputation to use this feature yet."
        />
      );
    }

    return (
      <Alert className="mt-4" title="Submission guidelines">
        <AlertParagraph>
          We want you to submit links that are well thought out, high value and
          high quality.
        </AlertParagraph>
        <AlertParagraph>
          Please do not add your own posts, promotional content, clickbait etc.
          Additionally, redirected or shortened URLs will be rejected, please
          submit the full and final URL.
        </AlertParagraph>
        <AlertParagraph>
          For more details see our{' '}
          <a
            className="text-theme-label-link hover:underline"
            href={contentGuidelinesLink}
            target="_blank"
            rel="noopener"
          >
            content guidelines
          </a>
        </AlertParagraph>
      </Alert>
    );
  };

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.StartSubmitArticle,
      feed_item_title: FeedItemTitle.SubmitArticle,
      extra: JSON.stringify({ has_access: !!user?.canSubmitArticle }),
    });

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFetched) {
    return <></>;
  }

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title={FeedItemTitle.SubmitArticle} />
      <Modal.Body>
        <form
          ref={submitFormRef}
          id="submit-article"
          aria-busy={isValidating}
          onSubmit={onSubmit}
        >
          <div>
            <p className="mb-2 text-theme-label-tertiary typo-callout">
              Found an interesting post? Do you want to share it with the
              community? Enter the post&apos;s URL / link below to add it to the
              feed.
            </p>
            {!isEnabled && (
              <p className="mb-2 mt-6 text-theme-label-tertiary typo-callout">
                You need more reputation to enable this feature
              </p>
            )}
            <a
              className="font-bold text-theme-label-link underline typo-callout"
              target="_blank"
              rel="noopener"
              href={communityLinksGuidelines}
            >
              Learn more
            </a>
            <p className="mb-4 mt-6 typo-callout">
              Daily suggestions used&nbsp;
              {submissionAvailability?.todaySubmissionsCount ?? 0}/
              {submissionAvailability?.limit ?? 3}
            </p>
            <TextField
              autoFocus
              type="url"
              autoComplete="off"
              leftIcon={<LinkIcon />}
              fieldType="tertiary"
              name="articleUrl"
              inputId="article_url"
              label="Paste post url"
              disabled={!isEnabled}
              hint={urlHint}
              valid={!urlHint}
              valueChanged={onUrlChanged}
            />
            {isSubmitted ? (
              <Alert
                className="mt-4"
                type={AlertType.Success}
                title="We will notify you about the post-submission status via email"
              />
            ) : (
              submissionAvailability?.todaySubmissionsCount === 3 && (
                <Alert
                  className="mt-4"
                  type={AlertType.Error}
                  title="You have reached the limit of 3 submissions per day"
                />
              )
            )}
            {isEnabled && (
              <EnableNotification
                source={NotificationPromptSource.CommunityPicks}
              />
            )}
            {getAlert()}
          </div>
        </form>
      </Modal.Body>
      {existingArticle && (
        <div className="w-full">
          <h4 className="mb-2 pl-6 font-bold typo-callout">Article exists</h4>
          <PostItemCard postItem={existingArticle} showButtons={false} />
        </div>
      )}
      <Modal.Footer justify={isSubmitted ? Justify.Center : Justify.End}>
        {(!isSubmitted || !!existingArticle) && (
          <Button
            variant={ButtonVariant.Primary}
            type="submit"
            aria-label="Submit article"
            disabled={!enableSubmission || !isEnabled || !!existingArticle}
            loading={isValidating}
            form="submit-article"
          >
            <span className={isValidating ? 'invisible' : ''}>
              Submit article
            </span>
          </Button>
        )}
        {isSubmitted && (
          <Button
            className="max-w-[22.5rem] flex-1"
            variant={ButtonVariant.Primary}
            aria-label="Close submit article modal"
            onClick={onRequestClose}
          >
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
