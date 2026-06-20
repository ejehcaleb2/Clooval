interface GuidedProgressBarProps {
  progress: number;
}

export function GuidedProgressBar({ progress }: GuidedProgressBarProps) {
  return (
    <div className="relative mx-auto mt-2 h-2 w-full max-w-4xl overflow-hidden rounded-full bg-[#E5E5E3]">
      <div
        className="h-full bg-[#111111] transition-[width] duration-280 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
