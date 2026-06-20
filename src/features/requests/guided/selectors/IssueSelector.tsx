import { Check } from 'lucide-react';

interface IssueOption {
  id: string;
  label: string;
  sublabel: string;
}

interface IssueSelectorProps {
  options: IssueOption[];
  selectedIssueIds: string[];
  additionalIssue: string;
  onToggleIssue: (option: IssueOption) => void;
  onAdditionalIssueChange: (value: string) => void;
  extraFlag?: (option: IssueOption) => string | null;
}

export function IssueSelector({
  options,
  selectedIssueIds,
  additionalIssue,
  onToggleIssue,
  onAdditionalIssueChange,
  extraFlag,
}: IssueSelectorProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedIssueIds.includes(option.id);
        const otherOption = option.id === 'other_issue';

        return (
          <div key={option.id} className="space-y-2">
            <button
              type="button"
              onClick={() => onToggleIssue(option)}
              className={`w-full px-6 py-4 flex items-start justify-between text-left transition ${
                selected
                  ? 'bg-[#F1F2E9] border-l-2 border-[#111111]'
                  : 'bg-white border border-[#E5E5E3] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111111]">{option.label}</span>
                  {extraFlag ? (
                    <span className="text-xs text-[#555555] uppercase tracking-[0.15em]">
                      {extraFlag(option)}
                    </span>
                  ) : null}
                </div>
                {option.sublabel ? (
                  <p className="text-xs text-[#555555] mt-2 leading-5">{option.sublabel}</p>
                ) : null}
              </div>
              <div
                className={`flex items-center justify-center shrink-0 h-5 w-5 rounded-sm border border-[#111111] ${
                  selected ? 'bg-[#111111]' : 'bg-white'
                }`}
              >
                {selected ? <Check className="w-3 h-3 text-white" /> : null}
              </div>
            </button>

            {otherOption && selected && (
              <div className="px-6 pb-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#555555] mb-2">
                  Share your custom issue
                </label>
                <input
                  value={additionalIssue}
                  onChange={(event) => onAdditionalIssueChange(event.target.value)}
                  placeholder="Type your issue"
                  className="w-full h-10 px-3 bg-white border border-[#E5E5E3] rounded-lg text-sm text-[#111111] focus:border-2 focus:border-[#111111] focus:outline-none"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
