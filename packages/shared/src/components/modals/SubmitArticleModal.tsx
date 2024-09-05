import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import AuthContext from '../../contexts/AuthContext';
import LogContext from '../../contexts/LogContext';
import { gqlClient } from '../../graphql/common';
import { PostItem } from '../../graphql/posts';
import {
  SUBMISSION_AVAILABILITY_QUERY,
  SubmissionAvailability,
  SUBMIT_ARTICLE_MUTATION,
  SubmitArticleResponse,
} from '../../graphql/submitArticle';
import { useToastNotification } from '../../hooks';
import {
  communityLinksGuidelines,
  contentGuidelines,
} from '../../lib/constants';
import { formToJson } from '../../lib/form';
import {
  FeedItemTitle,
  LogEvent,
  NotificationPromptSource,
} from '../../lib/log';
import { Button, ButtonVariant } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import { LinkIcon, LockIcon } from '../icons';
import EnableNotification from '../notifications/EnableNotification';
import PostItemCard from '../post/PostItemCard';
import { Justify } from '../utilities';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Modal, ModalProps } from './common/Modal';
import { ReputationAlert } from './ReputationAlert';

const defaultErrorMessage = 'Something went wrong, try again';
const formTitle = 'Community picks';

export default function SubmitArticleModal({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement {
  const submitFormRef = useRef<HTMLFormElement>();
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const { logEvent } = useContext(LogContext);
  const { displayToast } = useToastNotification();
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [existingArticle, setExistingArticle] = useState<PostItem>(null);
  const [urlHint, setUrlHint] = useState<string>();
  const availabilityKey = ['submission_availability', user?.id];
  const { data: access, isFetched } = useQuery<{
    submissionAvailability: SubmissionAvailability;
  }>(availabilityKey, () => gqlClient.request(SUBMISSION_AVAILABILITY_QUERY));
  const { submissionAvailability } = access || {};
  const dailyLimit = submissionAvailability?.limit ?? 3;
  const isEnabled = submissionAvailability?.hasAccess;
  const { mutateAsync: submitArticle } = useMutation<
    { submitArticle: SubmitArticleResponse },
    unknown,
    string
  >((articleUrl: string) =>
    gqlClient.request(SUBMIT_ARTICLE_MUTATION, {
      url: articleUrl,
    }),
  );

  const submitArticleFailEvent = (reason: string): void => {
    logEvent({
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

    logEvent({
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
        const updated = { submissionAvailability };
        updated.submissionAvailability.todaySubmissionsCount += 1;
        client.setQueryData(availabilityKey, updated);
        logEvent({ event_name: 'submit article succeed' });
        displayToast(
          'We will notify you about the post-submission status via email',
        );
        onRequestClose(null);
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
      return <ReputationAlert />;
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
            className="text-text-link hover:underline"
            href={contentGuidelines}
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
    logEvent({
      event_name: LogEvent.StartSubmitArticle,
      feed_item_title: FeedItemTitle.SubmitArticle,
      extra: JSON.stringify({ has_access: !!user?.canSubmitArticle }),
    });

    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isFetched) {
    return <></>;
  }

  const submitButtonProps = {
    'aria-label': 'Submit',
    loading: isValidating,
    disabled: !enableSubmission || !isEnabled || !!existingArticle,
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleTop}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      formProps={{
        form: 'submit-article',
        title: formTitle,
        rightButtonProps: submitButtonProps,
      }}
    >
      <Modal.Header title={formTitle} />
      <Modal.Body>
        <form
          ref={submitFormRef}
          id="submit-article"
          aria-busy={isValidating}
          onSubmit={onSubmit}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-4">
            <p className="text-text-tertiary typo-callout">
              Found an interesting post? Do you want to share it with the
              community? Enter the post&apos;s URL / link below to add it to the
              feed.
            </p>
            <a
              className="font-bold text-text-link underline typo-callout"
              target="_blank"
              rel="noopener"
              href={communityLinksGuidelines}
            >
              Learn more
            </a>
          </div>
          <p className="typo-callout">
            Daily suggestions used&nbsp;
            {submissionAvailability?.todaySubmissionsCount ?? 0}/{dailyLimit}
          </p>
          <TextField
            autoFocus
            type="url"
            autoComplete="off"
            leftIcon={<LinkIcon />}
            rightIcon={
              !isEnabled ? (
                <LockIcon className="text-text-disabled" />
              ) : undefined
            }
            fieldType="tertiary"
            name="articleUrl"
            inputId="article_url"
            label="Post url"
            disabled={!isEnabled}
            hint={urlHint}
            valid={!urlHint}
            valueChanged={onUrlChanged}
          />
          {submissionAvailability?.todaySubmissionsCount === dailyLimit && (
            <Alert
              type={AlertType.Error}
              title={`You have reached the limit of ${dailyLimit} submissions per day`}
            />
          )}
          {isEnabled && (
            <EnableNotification
              source={NotificationPromptSource.CommunityPicks}
            />
          )}
          {getAlert()}
        </form>
      </Modal.Body>
      {existingArticle && (
        <div className="w-full">
          <h4 className="mb-2 pl-6 font-bold typo-callout">Article exists</h4>
          <PostItemCard postItem={existingArticle} showButtons={false} />
        </div>
      )}
      <Modal.Footer justify={Justify.End}>
        <Button
          {...submitButtonProps}
          variant={ButtonVariant.Primary}
          type="submit"
          form="submit-article"
          loading={isValidating}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
