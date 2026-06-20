/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RequestStatus, PriorityLevel, RequestCategory } from "../../types";

interface BadgeProps {
  type: "status" | "priority" | "category";
  value: RequestStatus | PriorityLevel | RequestCategory;
  className?: string;
}

export function StatusBadge({ value, className = "" }: { value: RequestStatus; className?: string }) {
  const label = value.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-[10px] py-[6px] text-[11px] font-medium uppercase tracking-[0.5px] 
                 rounded-[4px] border border-solid bg-[#F1F2E9] text-[#111111] border-[#E5E5E3] ${className}`}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({ value, className = "" }: { value: PriorityLevel; className?: string }) {
  if (value === "urgent") {
    return <span className={`text-xs uppercase font-semibold text-[#111111] tracking-wider shrink-0 ${className}`}>URGENT</span>;
  }
  if (value === "high") {
    return <span className={`text-xs uppercase font-medium text-[#555555] tracking-wider shrink-0 ${className}`}>HIGH</span>;
  }
  if (value === "normal") {
    return <span className={`text-xs uppercase font-normal text-[#999999] tracking-wider shrink-0 ${className}`}>NORMAL</span>;
  }
  return <span className={`text-xs uppercase font-normal text-[#999999] tracking-wider shrink-0 ${className}`}>LOW</span>;
}
