/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ClipboardList, 
  Search, 
  Coins, 
  CheckCircle2, 
  Wrench, 
  MapPin, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X
} from "lucide-react";
import { RequestStatus } from "../types";

interface RepairProgressTrackerProps {
  status: RequestStatus;
  createdAt: string;
}

interface StageInfo {
  value: RequestStatus;
  label: string;
  desc: string;
  icon: React.ComponentType<any>;
}

const ALL_STAGES: StageInfo[] = [
  { value: "submitted", label: "REGISTERED", desc: "Your request has been logged in the Cloova system.", icon: ClipboardList },
  { value: "under_review", label: "DIAGNOSTIC", desc: "Our operators are reviewing your item details and photos.", icon: Search },
  { value: "quote_sent", label: "QUOTE READY", desc: "Pricing confirmed. Awaiting your approval.", icon: Coins },
  { value: "confirmed", label: "AUTHORISED", desc: "Deposit received. Provider assigned.", icon: CheckCircle2 },
  { value: "with_provider", label: "AT THE WORKSHOP", desc: "Vetted workshop in Port Louis repairing.", icon: Wrench },
  { value: "ready_for_collection", label: "READY FOR COLLECTION", desc: "Back on campus at the collection desk.", icon: MapPin },
  { value: "completed", label: "COMPLETED", desc: "Collected and verified by you.", icon: Sparkles },
];

const STAGE_EXPLANATIONS: { [key: string]: string } = {
  submitted: "Your request is safely logged in our system. A team operator is notified of your repair claim.",
  under_review: "Our operators are conducting a diagnostic review of your description and photos to scout for the best repair partner.",
  quote_sent: "The repair estimate and category metrics have been negotiated and verified. Review the breakdown to approve and proceed.",
  confirmed: "Deposit received and verified. Your item is authorized for secure transport, and a specialized technician is assigned.",
  with_provider: "Your repair item is at our vetted external specialist workshop in Port Louis. Certified diagnostics and parts replacements are under way.",
  ready_for_collection: "The item has passed quality checks and is locker-secured at the drop-off desk on campus, waiting for your collection.",
  completed: "You have reviewed the repair in person, retrieved the item, and finalized the service claim.",
};

export default function RepairProgressTracker({ status, createdAt }: RepairProgressTrackerProps) {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // Determine active status index
  const currentStageIndex = ALL_STAGES.findIndex((s) => s.value === status);
  
  // Percentage for modern gradient fill
  const progressRatio = currentStageIndex === -1 ? 0 : (currentStageIndex / (ALL_STAGES.length - 1)) * 100;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden select-none" id="repair-progress-tracker">
      {/* Editorial Header Section */}
      <div className="bg-neutral-50 px-6 py-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] font-mono block">
            Exclusive Student Concierge Tracker
          </span>
          <h3 className="font-serif text-xl font-normal text-neutral-900 mt-1">
            Repair Status Breakdown
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-neutral-600 font-semibold uppercase tracking-wider">
            Live concierge updates
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 md:p-8 space-y-8">
        {/* REPAIR STATUS BREAKDOWN VERTICAL TIMELINE */}
        <div className="border-t border-[#E5E5E3] pt-4 select-none">
          <div className="relative flex flex-col">
            {ALL_STAGES.map((stage, sIdx, arr) => {
              const isCompleted = sIdx < currentStageIndex;
              const isActive = sIdx === currentStageIndex;
              const isQueued = sIdx > currentStageIndex;

              return (
                <div key={sIdx} className="flex min-h-[64px] items-start relative py-4 px-4 transition-all">
                  {/* Vertical line connecting circles */}
                  {sIdx < arr.length - 1 && (
                    <div
                      className={`absolute left-[30px] top-[26px] bottom-0 w-[1px] ${
                        isCompleted || isActive ? "bg-[#111111]" : "bg-[#E5E5E3]"
                      }`}
                      style={{ height: "calc(100% - 12px)" }}
                    />
                  )}

                  {/* LEFT SIDE: A circle */}
                  <div className="w-[32px] flex justify-center shrink-0 z-10 mt-1">
                    {isCompleted ? (
                      <div className="w-5 h-5 bg-[#111111] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" strokeWidth="3" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 bg-white border-2 border-[#111111] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#111111] rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-white border border-[#E5E5E3] rounded-full" />
                    )}
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex-1 pl-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4
                          className={`text-[13px] uppercase tracking-wider ${
                            isCompleted
                              ? "text-[#111111] font-semibold"
                              : isActive
                              ? "text-[#111111] font-bold"
                              : "text-[#999999] font-medium"
                          }`}
                        >
                          {stage.label}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(activeTooltip === sIdx ? null : sIdx);
                          }}
                          className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition focus:outline-none shrink-0"
                          title="Learn about this stage"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </div>
                      <p className="text-[13px] text-[#555555] font-normal leading-tight">
                        {stage.desc}
                      </p>

                      {/* Info Popover Box */}
                      {activeTooltip === sIdx && (
                        <div className="relative mt-2 p-3 bg-neutral-900 border border-neutral-800 text-white rounded-lg text-xs leading-relaxed shadow-lg max-w-sm animate-fade-in z-20">
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltip(null);
                              }}
                              className="text-neutral-400 hover:text-white focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-semibold uppercase tracking-wider text-[9px] text-neutral-400 mb-1">
                            Stage Overview
                          </div>
                          <p className="pr-4 text-neutral-200">{STAGE_EXPLANATIONS[stage.value]}</p>
                        </div>
                      )}
                    </div>

                    {/* Far right: status chip */}
                    <div className="w-[80px] flex sm:justify-end shrink-0 mt-1 sm:mt-0">
                      {isCompleted && (
                        <span className="text-[11px] font-semibold font-mono uppercase tracking-wider text-[#27AE60]">
                          COMPLETE
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[11px] font-semibold font-mono uppercase text-white bg-[#111111] py-1.5 px-2.5 rounded-[4px] tracking-wider leading-none">
                          ACTIVE
                        </span>
                      )}
                      {isQueued && (
                        <span className="text-[11px] font-medium font-mono uppercase tracking-wider text-[#999999]">
                          QUEUED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Master Timeline Progress Line */}
        <div className="space-y-4 pt-2">
          <div className="relative h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-neutral-900 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-neutral-500 tracking-wider">
            <span>START</span>
            <span className="text-neutral-900 uppercase">
              {progressRatio === 100 ? "100% Resolved" : `${Math.round(progressRatio)}% Progress Completed`}
            </span>
            <span>DELIVERED</span>
          </div>
        </div>

        {/* Safety Assured Footer */}
        <div className="pt-4 border-t border-neutral-100 bg-neutral-50/50 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-neutral-900">
              Trusted Cloova Security Protocols Enforced
            </h5>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Every item collected is documented visually and stored securely. Our concierge team personally verifies logistics and ensures that you pay only the remaining balance upon final, physical review of your items on campus.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
