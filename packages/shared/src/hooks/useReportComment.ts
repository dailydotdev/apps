import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../contexts/AuthContext';
import { BooleanPromise } from '../components/filters/common';
import { AuthTriggers } from '../lib/auth';
import { useRequestProtocol } from './useRequestProtocol';
import {
  ReportCommentReason,
  REPORT_COMMENT_MUTATION,
} from '../graphql/comments';

type UseReportCommentRet = {
  reportComment: (variables: {
    commentId: string;
    reason: ReportCommentReason;
    note?: string;
  }) => BooleanPromise;
};

interface ReportCommentProps {
  commentId: string;
  reason: ReportCommentReason;
  note: string;
}

export default function useReportComment(): UseReportCommentRet {
  const { user, showLogin } = useContext(AuthContext);
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: reportCommentAsync } = useMutation<
    void,
    unknown,
    ReportCommentProps
  >((variables) => requestMethod(REPORT_COMMENT_MUTATION, variables));

  const reportComment = async (params: ReportCommentProps) => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.ReportPost });
      return { successful: false };
    }

    await reportCommentAsync(params);

    return { successful: true };
  };

  return { reportComment };
}
