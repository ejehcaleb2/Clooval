import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
  label
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-7",
    md: "w-12 h-10",
    lg: "w-16 h-13"
  };

  return (
    <div className={`flex flex-col items-center justify-center py-4 ${className}`}>
      {/* MasterCard-style rolling overlapping circles animation */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 46 40"
          className={`${sizeClasses[size]} text-[#111111] animate-[spin_1.4s_infinite_linear]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="left-circle-clip">
              <circle cx="17" cy="20" r="14" />
            </clipPath>
          </defs>
          
          {/* Central intersecting layer with half transparency */}
          <circle 
            cx="29" 
            cy="20" 
            r="14" 
            fill="currentColor" 
            fillOpacity="0.85" 
            clipPath="url(#left-circle-clip)" 
          />
          
          {/* Left Ring (e.g. bold dark slate) */}
          <circle 
            cx="17" 
            cy="20" 
            r="14" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeOpacity="0.9"
            fill="none" 
          />
          
          {/* Right Ring */}
          <circle 
            cx="29" 
            cy="20" 
            r="14" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeOpacity="0.9"
            fill="none" 
          />
        </svg>
      </div>
    </div>
  );
}
