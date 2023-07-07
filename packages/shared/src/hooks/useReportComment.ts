import { useContext } from 'react';
import { useMutation } from 'react-query';
import { graphqlUrl } from '../lib/config';
import AuthContext from '../contexts/AuthContext';
import { BooleanPromise } from '../components/filters/common';
import { AuthTriggers } from '../lib/auth';
import { useRequestProtocol } from './useRequestProtocol';
import {
  ReportCommentReason,
  REPORT_COMMENT_MUTATION,
  Comment,
} from '../graphql/comments';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { useToastNotification } from './useToastNotification';

type UseReportCommentRet = {
  openReportCommentModal: (comment: Comment) => void;
  reportComment: (variables: {
    id: string;
    reason: ReportCommentReason;
    text?: string;
  }) => BooleanPromise;
};

interface ReportCommentProps {
  id: string;
  reason: ReportCommentReason;
  text: string;
}

export default function useReportComment(): UseReportCommentRet {
  const { user, showLogin } = useContext(AuthContext);
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: reportCommentAsync } = useMutation<
    void,
    unknown,
    ReportCommentProps
  >((variables) =>
    requestMethod(graphqlUrl, REPORT_COMMENT_MUTATION, variables),
  );

  const onReportCallback = async (): Promise<void> => {
    displayToast('🚨 Thanks for reporting!');
  };

  const openReportCommentModal = (comment: Comment) => {
    openModal({
      type: LazyModal.ReportComment,
      props: {
        onReport: onReportCallback,
        comment,
      },
    });
  };

  const reportComment = async (params: ReportCommentProps) => {
    console.log('params', params);

    if (!user) {
      showLogin(AuthTriggers.ReportPost);
      return { successful: false };
    }

    // TODO: Fix this
    // await reportCommentAsync(params);

    return { successful: true };
  };

  return { openReportCommentModal, reportComment };
}
