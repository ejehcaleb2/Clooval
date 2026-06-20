import { Check } from 'lucide-react';

interface BrandOption {
  id: string;
  label: string;
}

interface BrandSelectorProps {
  options: BrandOption[];
  selectedId?: string | null;
  customValue: string;
  onSelect: (id: string, label: string) => void;
  onCustomTextChange: (value: string) => void;
}

export function BrandSelector({ options, selectedId, customValue, onSelect, onCustomTextChange }: BrandSelectorProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => {
        const isOther = option.id.includes('other');
        const selected = selectedId === option.id;

        return (
          <div key={option.id} className="space-y-2">
            <button
              type="button"
              onClick={() => onSelect(option.id, option.label)}
              className={`w-full h-[52px] px-6 flex items-center justify-between text-left transition ${
                selected
                  ? 'bg-[#F1F2E9] border-l-2 border-[#111111]'
                  : 'bg-white border border-[#E5E5E3] hover:bg-[#F7F7F5]'
              }`}
            >
              <span className={`text-sm font-semibold ${selected ? 'text-[#111111]' : 'text-[#111111]'}`}>
                {option.label}
              </span>
              {selected && (
                <span className="h-5 w-5 rounded-full bg-[#111111] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
            </button>

            {isOther && selected && (
              <div className="px-6 pb-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#555555] mb-2">
                  Specify your brand
                </label>
                <input
                  value={customValue}
                  onChange={(event) => onCustomTextChange(event.target.value)}
                  placeholder="Type your brand"
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
