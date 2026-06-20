import { BrandSelector } from './selectors/BrandSelector';
import { IssueSelector } from './selectors/IssueSelector';
import { ModelSelector } from './selectors/ModelSelector';
import { phoneBrands, phoneIssues } from './data/phoneBrands';

interface PhoneFlowState {
  brand: string | null;
  brandId: string | null;
  model: string | null;
  modelId: string | null;
  issueType: string[];
  additionalIssue: string;
}

interface PhoneFlowProps {
  step: number;
  data: PhoneFlowState;
  setData: (updates: Partial<PhoneFlowState>) => void;
}

export function PhoneFlow({ step, data, setData }: PhoneFlowProps) {
  const selectedBrand = phoneBrands.find((item) => item.id === data.brandId);
  const modelList = selectedBrand?.models ?? [];

  const handleSelectBrand = (id: string, label: string) => {
    setData({
      brandId: id,
      brand: id.includes('other') ? label : label,
      model: null,
      modelId: null,
    });
  };

  const handleSelectModel = (id: string, label: string) => {
    if (id === 'other_model') {
      setData({ modelId: id, model: data.model ?? 'Other' });
      return;
    }

    setData({ modelId: id, model: label });
  };

  const handleToggleIssue = (option: { id: string; label: string }) => {
    const selected = data.issueType.includes(option.id);
    const nextIssues = selected
      ? data.issueType.filter((issueId) => issueId !== option.id)
      : [...data.issueType, option.id];

    setData({ issueType: nextIssues });
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E5E3] bg-[#F7F7F5] p-4 text-sm text-[#555555]">
            Select the smartphone brand first. If your model is not listed, choose Other and type it in.
          </div>
          <BrandSelector
            options={phoneBrands}
            selectedId={data.brandId}
            customValue={data.brandId?.includes('other') ? data.brand ?? '' : ''}
            onSelect={handleSelectBrand}
            onCustomTextChange={(value) => setData({ brand: value })}
          />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <ModelSelector
            models={modelList}
            selectedModelId={data.modelId}
            selectedModelValue={data.model ?? ''}
            customValue={data.model ?? ''}
            onSelect={handleSelectModel}
            onCustomTextChange={(value) => setData({ model: value })}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <IssueSelector
          options={phoneIssues}
          selectedIssueIds={data.issueType}
          additionalIssue={data.additionalIssue}
          onToggleIssue={(option) => handleToggleIssue(option)}
          onAdditionalIssueChange={(value) => setData({ additionalIssue: value })}
        />
      </div>
    );
  };

  return <div className="space-y-6">{renderStep()}</div>;
}
