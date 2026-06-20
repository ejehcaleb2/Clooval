import { ChevronLeft } from 'lucide-react';

interface GuidedStepHeaderProps {
  title: string;
  stepLabel: string;
  stepCount: string;
  onBack: () => void;
}

export function GuidedStepHeader({ title, stepLabel, stepCount, onBack }: GuidedStepHeaderProps) {
  return (
    <header className="sticky top-2 z-50 bg-white border-b border-[#E5E5E3] px-4 sm:px-6 h-[52px] flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="w-[40px] h-[40px] rounded-lg flex items-center justify-center text-[#111111] transition hover:bg-[#F7F7F5]"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex-1 text-center">
        <p className="text-[13px] font-semibold text-[#111111] leading-none">{title}</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#555555] mt-1">{stepLabel}</p>
      </div>

      <div className="min-w-[70px] text-right">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999]">{stepCount}</p>
      </div>
    </header>
  );
}
