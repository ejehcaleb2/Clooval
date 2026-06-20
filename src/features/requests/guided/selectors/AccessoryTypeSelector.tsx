import { Check } from 'lucide-react';

interface AccessoryTypeOption {
  id: string;
  label: string;
  sublabel: string;
}

interface AccessoryTypeSelectorProps {
  options: AccessoryTypeOption[];
  selectedId?: string | null;
  onSelect: (id: string, label: string) => void;
}

export function AccessoryTypeSelector({ options, selectedId, onSelect }: AccessoryTypeSelectorProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const selected = selectedId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id, option.label)}
            className={`w-full px-6 py-4 flex items-start justify-between text-left transition ${
              selected
                ? 'bg-[#F1F2E9] border-l-2 border-[#111111]'
                : 'bg-white border border-[#E5E5E3] hover:bg-[#F7F7F5]'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-[#111111]">{option.label}</p>
              {option.sublabel ? (
                <p className="text-xs text-[#555555] mt-2 leading-5">{option.sublabel}</p>
              ) : null}
            </div>
            {selected && (
              <span className="h-5 w-5 rounded-full bg-[#111111] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
