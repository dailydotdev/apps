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
} from '../graphql/comments';
import { useToastNotification } from './useToastNotification';

type UseReportCommentRet = {
  reportComment: (variables: {
    commentId: string;
    reason: ReportCommentReason;
    note?: string;
  }) => BooleanPromise;
  onReportCallback: () => Promise<void>;
};

interface ReportCommentProps {
  commentId: string;
  reason: ReportCommentReason;
  note: string;
}

export default function useReportComment(): UseReportCommentRet {
  const { user, showLogin } = useContext(AuthContext);
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

  const reportComment = async (params: ReportCommentProps) => {
    if (!user) {
      showLogin(AuthTriggers.ReportPost);
      return { successful: false };
    }

    await reportCommentAsync(params);

    return { successful: true };
  };

  return { reportComment, onReportCallback };
}
