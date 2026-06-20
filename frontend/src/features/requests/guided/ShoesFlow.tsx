import { IssueSelector } from './selectors/IssueSelector';
import { shoeIssues } from './data/issueOptions';

interface ShoesFlowState {
  issueType: string[];
  additionalIssue: string;
}

interface ShoesFlowProps {
  data: ShoesFlowState;
  setData: (updates: Partial<ShoesFlowState>) => void;
}

export function ShoesFlow({ data, setData }: ShoesFlowProps) {
  const handleToggleIssue = (option: { id: string; label: string }) => {
    const selected = data.issueType.includes(option.id);
    const nextIssues = selected
      ? data.issueType.filter((issueId) => issueId !== option.id)
      : [...data.issueType, option.id];

    setData({ issueType: nextIssues });
  };

  return (
    <div className="space-y-6">
      <IssueSelector
        options={shoeIssues}
        selectedIssueIds={data.issueType}
        additionalIssue={data.additionalIssue}
        onToggleIssue={(option) => handleToggleIssue(option)}
        onAdditionalIssueChange={(value) => setData({ additionalIssue: value })}
      />
    </div>
  );
}
