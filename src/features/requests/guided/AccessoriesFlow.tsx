import { AccessoryTypeSelector } from './selectors/AccessoryTypeSelector';
import { BrandSelector } from './selectors/BrandSelector';
import { IssueSelector } from './selectors/IssueSelector';
import { accessoryTypes, accessoryBrands, accessoryIssues } from './data/accessoryData';

interface AccessoriesFlowState {
  accessoryType: string | null;
  accessoryTypeId: string | null;
  brand: string | null;
  brandId: string | null;
  issueType: string[];
  additionalIssue: string;
}

interface AccessoriesFlowProps {
  step: number;
  data: AccessoriesFlowState;
  setData: (updates: Partial<AccessoriesFlowState>) => void;
}

export function AccessoriesFlow({ step, data, setData }: AccessoriesFlowProps) {
  const selectedType = accessoryTypes.find((item) => item.id === data.accessoryTypeId);
  const brandOptions = selectedType
    ? accessoryBrands[selectedType.id].map((label) => ({
        id: label === 'Other' ? 'other_accessory_brand' : label.toLowerCase().replace(/\s+/g, '_'),
        label,
      }))
    : [];

  const handleSelectAccessoryType = (id: string, label: string) => {
    setData({
      accessoryTypeId: id,
      accessoryType: label,
      brandId: null,
      brand: null,
      issueType: [],
      additionalIssue: '',
    });
  };

  const handleSelectBrand = (id: string, label: string) => {
    setData({ brandId: id, brand: id === 'other_accessory_brand' ? label : label });
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
          <AccessoryTypeSelector
            options={accessoryTypes}
            selectedId={data.accessoryTypeId}
            onSelect={handleSelectAccessoryType}
          />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <BrandSelector
            options={brandOptions}
            selectedId={data.brandId}
            customValue={data.brandId === 'other_accessory_brand' ? data.brand ?? '' : ''}
            onSelect={handleSelectBrand}
            onCustomTextChange={(value) => setData({ brand: value })}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <IssueSelector
          options={accessoryIssues}
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
