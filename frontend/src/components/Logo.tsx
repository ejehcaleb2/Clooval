import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "small" | "medium" | "large";
}

const SIZE_MAP = {
  small: {
    icon: "w-9 h-8",
    largeChar: "text-[42px]",
    smallChars: "text-[24px]",
    subText: "text-[7px]",
    lineWidth: "w-[80px]",
  },
  medium: {
    icon: "w-12 h-10",
    largeChar: "text-[58px]",
    smallChars: "text-[32px]",
    subText: "text-[7.5px]",
    lineWidth: "w-[100px]",
  },
  large: {
    icon: "w-14 h-12",
    largeChar: "text-[68px]",
    smallChars: "text-[36px]",
    subText: "text-[8.5px]",
    lineWidth: "w-[110px]",
  },
};

export default function Logo({ className = "", iconOnly = false, size = "medium" }: LogoProps) {
  const styles = SIZE_MAP[size];

  return (
    <div className={`flex items-center gap-0 select-none ${className}`}>
      <div className="shrink-0 flex items-center">
        <svg
          viewBox="0 0 46 40"
          className={`${styles.icon} text-[#111111]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="left-circle-clip">
              <circle cx="17" cy="20" r="14" />
            </clipPath>
          </defs>
          <circle cx="29" cy="20" r="14" fill="currentColor" clipPath="url(#left-circle-clip)" />
          <circle cx="17" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <circle cx="29" cy="20" r="14" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left -ml-[16px] mt-[2px]">
          <div className="flex items-baseline leading-none font-serif tracking-[-0.07em]">
            <span className={`${styles.largeChar} font-normal text-[#111111] leading-[0.65] select-none`}>C</span>
            <span className={`${styles.smallChars} font-normal text-[#111111] -ml-[6px] select-none leading-none`}>loova</span>
          </div>
          <div className="flex flex-col mt-[4px] items-start ml-[11px]">
            <span className={`${styles.subText} font-bold text-[#333333] uppercase tracking-[0.24em] leading-none select-none`}>
              CAMPUS CONCIERGE
            </span>
            <div className={`${styles.lineWidth} h-[0.75px] bg-[#999999]/60 mt-1.5 self-start ml-[14px]`} />
          </div>
        </div>
      )}
    </div>
  );
}
