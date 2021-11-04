import { useMutation } from 'react-query';
import request from 'graphql-request';
import { useContext } from 'react';
import {
  HIDE_POST_MUTATION,
  REPORT_POST_MUTATION,
  ReportReason,
} from '../graphql/posts';
import { apiUrl } from '../lib/config';
import AnalyticsContext from '../contexts/AnalyticsContext';

type UseReportPostRet = {
  reportPost: (variables: {
    id: string;
    reason: ReportReason;
    comment?: string;
  }) => Promise<void>;
  hidePost: (id: string) => Promise<void>;
};

export default function useReportPost(): UseReportPostRet {
  const { trackEvent } = useContext(AnalyticsContext);

  const { mutateAsync: reportPost } = useMutation<
    void,
    unknown,
    { id: string; reason: ReportReason; comment: string }
  >((variables) => {
    trackEvent({
      event_name: 'report post',
      target_type: 'post',
      target_id: variables.id,
      extra: JSON.stringify({ origin: 'feed', reason: variables?.reason }),
    });
    return request(`${apiUrl}/graphql`, REPORT_POST_MUTATION, variables);
  });

  const { mutateAsync: hidePost } = useMutation<void, unknown, string>((id) => {
    trackEvent({
      event_name: 'hide post',
      target_type: 'post',
      target_id: id,
      extra: JSON.stringify({ origin: 'feed' }),
    });
    return request(`${apiUrl}/graphql`, HIDE_POST_MUTATION, { id });
  });

  return { reportPost, hidePost };
}
