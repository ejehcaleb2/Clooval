import { BrandSelector } from './selectors/BrandSelector';
import { IssueSelector } from './selectors/IssueSelector';
import { ModelSelector } from './selectors/ModelSelector';
import { laptopBrands, laptopIssues } from './data/laptopBrands';

interface LaptopFlowState {
  brand: string | null;
  brandId: string | null;
  model: string | null;
  modelId: string | null;
  issueType: string[];
  additionalIssue: string;
}

interface LaptopFlowProps {
  step: number;
  data: LaptopFlowState;
  setData: (updates: Partial<LaptopFlowState>) => void;
}

export function LaptopFlow({ step, data, setData }: LaptopFlowProps) {
  const selectedBrand = laptopBrands.find((item) => item.id === data.brandId);
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

  const onlySoftwareSelected = data.issueType.length === 1 && data.issueType.includes('software');

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E5E5E3] bg-[#F7F7F5] p-4 text-sm text-[#555555]">
            Pick the laptop brand first so we can show models that match your machine.
          </div>
          <BrandSelector
            options={laptopBrands}
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
        {onlySoftwareSelected ? (
          <div className="rounded-lg border border-[#E5E5E3] bg-[#F7F7F5] p-4 text-sm text-[#555555]">
            For software issues, we can help with diagnostics, virus cleanup, and OS repairs.
          </div>
        ) : null}
        <IssueSelector
          options={laptopIssues}
          selectedIssueIds={data.issueType}
          additionalIssue={data.additionalIssue}
          onToggleIssue={(option) => handleToggleIssue(option)}
          onAdditionalIssueChange={(value) => setData({ additionalIssue: value })}
          extraFlag={(option) => (option.id === 'software' ? 'Software' : null)}
        />
      </div>
    );
  };

  return <div className="space-y-6">{renderStep()}</div>;
}
