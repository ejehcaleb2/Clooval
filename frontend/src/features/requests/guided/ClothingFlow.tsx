import { IssueSelector } from './selectors/IssueSelector';
import { clothingIssues } from './data/issueOptions';

interface ClothingFlowState {
  issueType: string[];
  additionalIssue: string;
}

interface ClothingFlowProps {
  data: ClothingFlowState;
  setData: (updates: Partial<ClothingFlowState>) => void;
}

export function ClothingFlow({ data, setData }: ClothingFlowProps) {
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
        options={clothingIssues}
        selectedIssueIds={data.issueType}
        additionalIssue={data.additionalIssue}
        onToggleIssue={(option) => handleToggleIssue(option)}
        onAdditionalIssueChange={(value) => setData({ additionalIssue: value })}
      />
    </div>
  );
}
