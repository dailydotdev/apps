import React, { ReactElement, useContext, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { Button } from '../buttons/Button';
import { formToJson } from '../../lib/form';
import { apiUrl } from '../../lib/config';
import {
  communityLinksGuidelines,
  submissionGuidelineDocsLink,
} from '../../lib/constants';
import { TextField } from '../fields/TextField';
import AuthContext from '../../contexts/AuthContext';
import {
  SubmissionAvailability,
  SUBMISSION_AVAILABILITY_QUERY,
  SubmitArticleResposne,
  SUBMIT_ARTICLE_MUTATION,
} from '../../graphql/submitArticle';
import PostItemCard from '../post/PostItemCard';
import { PostItem } from '../../graphql/posts';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import LinkIcon from '../icons/Link';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Modal, ModalProps } from './common/Modal';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';

type SubmitArticleModalProps = {
  headerCopy: string;
  submitArticleModalButton: string;
} & ModalProps;

const defaultErrorMessage = 'Something went wrong, try again';

export default function SubmitArticleModal({
  headerCopy,
  submitArticleModalButton,
  onRequestClose,
  ...modalProps
}: SubmitArticleModalProps): ReactElement {
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
  }>(availabilityKey, () =>
    request(`${apiUrl}/graphql`, SUBMISSION_AVAILABILITY_QUERY),
  );
  const { submissionAvailability } = access || {};
  const isEnabled = submissionAvailability?.hasAccess;
  const { mutateAsync: submitArticle } = useMutation<
    { submitArticle: SubmitArticleResposne },
    unknown,
    string
  >((articleUrl: string) =>
    request(`${apiUrl}/graphql`, SUBMIT_ARTICLE_MUTATION, {
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
      feed_item_title: submitArticleModalButton,
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
          We want you to submit articles that are well thought out, high value
          and high quality.
        </AlertParagraph>
        <AlertParagraph>
          Please do not add your own posts, promotional content, clickbait etc.
          Additionally, redirected or shortened URLs will be rejected, please
          submit the full and final URL.
        </AlertParagraph>
        <AlertParagraph>
          For more details see our{' '}
          <a
            className="hover:underline text-theme-label-link"
            href={submissionGuidelineDocsLink}
            target="_blank"
            rel="noopener"
          >
            Community Picks submission guidelines
          </a>
        </AlertParagraph>
      </Alert>
    );
  };

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
      <Modal.Header title={headerCopy} />
      <Modal.Body>
        <form
          ref={submitFormRef}
          id="submit-article"
          aria-busy={isValidating}
          onSubmit={onSubmit}
        >
          <div>
            <p className="mb-2 typo-callout text-theme-label-tertiary">
              Found an interesting article? Do you want to share it with the
              community? Enter the article&apos;s URL / link below to add it to
              the feed.
            </p>
            {!isEnabled && (
              <p className="mt-6 mb-2 typo-callout text-theme-label-tertiary">
                You need more reputation to enable this feature
              </p>
            )}
            <a
              className="font-bold underline typo-callout text-theme-label-link"
              target="_blank"
              rel="noopener"
              href={communityLinksGuidelines}
            >
              Learn more
            </a>
            <p className="mt-6 mb-4 typo-callout">
              Daily suggestions used&nbsp;
              {submissionAvailability?.todaySubmissionsCount ?? 0}/
              {submissionAvailability?.limit ?? 3}
            </p>
            <TextField
              autoFocus
              type="url"
              leftIcon={<LinkIcon />}
              fieldType="tertiary"
              name="articleUrl"
              inputId="article_url"
              label="Paste article url"
              disabled={!isEnabled}
              hint={urlHint}
              valid={!urlHint}
              valueChanged={onUrlChanged}
            />
            {isSubmitted ? (
              <Alert
                className="mt-4"
                type={AlertType.Success}
                title="You will be notified via email about the article request status"
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
          <h4 className="pl-6 mb-2 font-bold typo-callout">Article exists</h4>
          <PostItemCard postItem={existingArticle} showButtons={false} />
        </div>
      )}
      {(!isSubmitted || !!existingArticle) && (
        <Modal.Footer>
          <Button
            className="btn-primary"
            type="submit"
            aria-label={submitArticleModalButton}
            disabled={!enableSubmission || !isEnabled || !!existingArticle}
            loading={isValidating}
            form="submit-article"
          >
            <span className={isValidating && 'invisible'}>
              {submitArticleModalButton}
            </span>
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
