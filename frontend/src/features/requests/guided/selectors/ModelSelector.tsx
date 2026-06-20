import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ModelSelectorProps {
  models: string[];
  selectedModelId?: string | null;
  selectedModelValue: string;
  customValue: string;
  onSelect: (id: string, label: string) => void;
  onCustomTextChange: (value: string) => void;
}

export function ModelSelector({
  models,
  selectedModelId,
  selectedModelValue,
  customValue,
  onSelect,
  onCustomTextChange,
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredModels = useMemo(() => {
    if (!normalizedQuery) {
      return models;
    }

    return models.filter((model) => model.toLowerCase().includes(normalizedQuery));
  }, [models, normalizedQuery]);

  const modelOptions = filteredModels.map((label) => ({ id: label, label }));
  modelOptions.push({ id: 'other_model', label: 'Other' });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-[#999999] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search model"
          className="w-full h-10 pl-10 pr-6 bg-white border-b border-[#E5E5E3] text-sm text-[#111111] focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {modelOptions.map((option) => {
          const selected = selectedModelId === option.id;
          const isOther = option.id === 'other_model';

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
                <span className="text-sm font-semibold text-[#111111]">{option.label}</span>
                {selected && (
                  <span className="h-5 w-5 rounded-full bg-[#111111] flex items-center justify-center">
                    <Search className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>

              {isOther && selected && (
                <div className="px-6 pb-4">
                  <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#555555] mb-2">
                    Tell us the model name
                  </label>
                  <input
                    value={customValue}
                    onChange={(event) => onCustomTextChange(event.target.value)}
                    placeholder="Type your model"
                    className="w-full h-10 px-3 bg-white border border-[#E5E5E3] rounded-lg text-sm text-[#111111] focus:border-2 focus:border-[#111111] focus:outline-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
