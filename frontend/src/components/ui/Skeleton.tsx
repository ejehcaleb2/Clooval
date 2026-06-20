/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface SkeletonProps {
  width?: string; // e.g. "100%", "200px"
  height?: string; // e.g. "20px"
  borderRadius?: string; // e.g. "4px", "9999px"
  className?: string;
  key?: string | number;
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`bg-[#EFEFED] animate-pulse-glow ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
      role="status"
      aria-label="Loading content..."
    />
  );
}
