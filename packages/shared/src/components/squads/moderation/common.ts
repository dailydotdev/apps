export interface CommonModerationProps {
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}
