import { useEffect } from 'react';

interface OtherFlowProps {
  onComplete: () => void;
}

export function OtherFlow({ onComplete }: OtherFlowProps) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);

  return null;
}
