/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequest, useUpdateRequest, useProviders, useRequests, useDeleteRequest } from "../../hooks/queries";
import { PriorityBadge, StatusBadge } from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import { useToastStore } from "../../lib/store";
import { CATEGORY_ICONS } from "../requests/StudentHome";
import {
  ArrowLeft,
  Calendar,
  PenTool,
  Coins,
  Send,
  HelpCircle,
  FileText,
  User,
  Smartphone,
  CheckCircle,
  X,
  ExternalLink,
  Lock,
  Unlock,
  Bookmark,
  ChevronDown,
  Search,
  Wrench,
  Sparkles,
  ClipboardList,
  Clock,
} from "lucide-react";

const WORKFLOW_STAGES = [
  { value: "submitted", label: "Submitted", desc: "Claim logged", icon: ClipboardList },
  { value: "under_review", label: "Under Review", desc: "Inspection & diagnosis", icon: Search },
  { value: "quote_sent", label: "Quote Sent", desc: "Pricing estimate ready", icon: Coins },
  { value: "confirmed", label: "Confirmed", desc: "Operator authorized", icon: CheckCircle },
  { value: "with_provider", label: "In Repair", desc: "At specialist boutique", icon: Wrench },
  { value: "ready_for_collection", label: "Ready", desc: "Safe to collect", icon: HelpCircle }, // fallback or package check
  { value: "completed", label: "Completed", desc: "Job finalized", icon: Sparkles },
];

export default function AdminRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const { data: request, isLoading: requestLoading, error: requestError } = useRequest(id || "");
  const { data: allRequests } = useRequests();
  const { data: providers, isLoading: providersLoading } = useProviders();
  const updateMutation = useUpdateRequest(id || "");

  // Local control state matching workbench
  const [status, setStatus] = useState("");
  const [providerCost, setProviderCost] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [operatorNotes, setOperatorNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [providerId, setProviderId] = useState("");
  const [provTranslate, setProvTranslate] = useState("");
  const [readyNotes, setReadyNotes] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showAdminCancelConfirm, setShowAdminCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteRequest();

  // Sync state with request db values
  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setProviderCost(request.providerCost || 0);
      setServiceCharge(request.serviceCharge || 0);
      setOperatorNotes(request.operatorNotes || "");
      setInternalNotes(request.internalNotes || "");
      setProviderId(request.providerId || "");
      setProvTranslate(request.providerTranslation || "");
      setReadyNotes(request.readyNotes || "");
      setCancelReasonText(request.cancelReason || "");
    }
  }, [request]);

  if (requestLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton width="150px" height="24px" />
        <Skeleton width="100%" height="240px" />
      </div>
    );
  }

  if (requestError || !request) {
    return (
      <div className="py-12 text-center text-red-600 font-semibold uppercase tracking-wider text-xs">
        Request record not found in system
      </div>
    );
  }

  // Cost total arithmetic conversion
  const totalCalculated = Number(providerCost) + Number(serviceCharge);
  const quoteApproved = request.status === "confirmed" && request.isQuoteAccepted === true;
  const quoteDeclined = request.status === "cancelled" && request.isQuoteAccepted === false;

  // Individual save triggers
  const handleSaveNotes = () => {
    updateMutation.mutate(
      { operatorNotes },
      { onSuccess: () => addToast("Operator notes updated successfully", "success") }
    );
  };

  const handleSaveInternalNotes = () => {
    updateMutation.mutate(
      { internalNotes },
      { onSuccess: () => addToast("Internal private notes saved", "success") }
    );
  };

  const handleAssignProvider = (pId: string) => {
    setProviderId(pId);
    updateMutation.mutate(
      { providerId: pId },
      { onSuccess: () => addToast("Provider assignation recorded", "success") }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const label = WORKFLOW_STAGES.find(s => s.value === newStatus)?.label || newStatus;
    updateMutation.mutate(
      { status: newStatus as any },
      { onSuccess: () => addToast(`Cloova state successfully advanced to "${label}"`, "success") }
    );
  };

  const handleUncancelRequest = () => {
    updateMutation.mutate(
      { status: "under_review", isQuoteAccepted: undefined, cancelReason: undefined },
      {
        onSuccess: () => {
          setStatus("under_review");
          addToast("Request successfully restored and set to 'Under Review'", "success");
        }
      }
    );
  };

  const handleSaveAllAndCloseCard = () => {
    updateMutation.mutate(
      {
        providerCost: Number(providerCost),
        providerTranslation: provTranslate,
      },
      {
        onSuccess: () => {
          setProviderModalOpen(false);
          addToast("Creole card specs successfully synchronized & updated", "success");
          window.open(`/job-card/${request.id}`, "_blank");
        }
      }
    );
  };

  const handleSendQuote = () => {
    const isAlreadySent = request.status === "quote_sent";
    updateMutation.mutate(
      {
        providerCost: Number(providerCost),
        serviceCharge: Number(serviceCharge),
        status: "quote_sent",
      },
      {
        onSuccess: () => {
          setStatus("quote_sent");
          if (isAlreadySent) {
            addToast("MUR repair pricing quote successfully updated & synchronized with student!", "success");
          } else {
            addToast("MUR repair pricing quote successfully sent to student!", "success");
          }
        },
      }
    );
  };

  const IconComponent = CATEGORY_ICONS[request.category] || HelpCircle;

  // Calculate estimated completion based on category, priority and service volume
  const activeRequestsCount = allRequests
    ? allRequests.filter((r) => r.status !== "completed" && r.status !== "cancelled").length
    : 0;

  let baseHours = 48; // default
  let categoryLabel = "Standard Item";
  if (request.category === "phone") {
    baseHours = 48; // 2 days
    categoryLabel = "Phone Repair";
  } else if (request.category === "laptop") {
    baseHours = 72; // 3 days
    categoryLabel = "Laptop Repair";
  } else if (request.category === "clothing") {
    baseHours = 24; // 1 day
    categoryLabel = "Clothing Fix";
  } else if (request.category === "shoe") {
    baseHours = 36; // 1.5 days
    categoryLabel = "Shoe Fix";
  } else if (request.category === "accessories") {
    baseHours = 48; // 2 days
    categoryLabel = "Accessories Repair";
  } else if (request.category === "other") {
    baseHours = 60; // 2.5 days
    categoryLabel = "Custom Repair";
  }

  // Service volume load multipliers
  let volumeMultiplier = 1.0;
  let volumeStatus = "Low Volume (Optimal)";
  let volumeColor = "text-emerald-700 bg-emerald-50/50 border-emerald-200";
  let volumeDesc = "No operator delays - fast resolution is on track.";

  if (activeRequestsCount > 8) {
    volumeMultiplier = 1.6;
    volumeStatus = "Severe Volume (High Queues)";
    volumeColor = "text-rose-700 bg-rose-50/50 border-rose-200";
    volumeDesc = "+60% extra duration delay applied.";
  } else if (activeRequestsCount > 4) {
    volumeMultiplier = 1.25;
    volumeStatus = "Moderate Volume (Elevated Queues)";
    volumeColor = "text-amber-700 bg-amber-50/50 border-amber-200";
    volumeDesc = "+25% latency delay applied.";
  }

  // Priority scale multiplier
  let priorityMultiplier = 1.0;
  let priorityLabel = "Normal workflow speed";
  if (request.priority === "high") {
    priorityMultiplier = 0.75;
    priorityLabel = "Expedited workflow speed (-25%)";
  } else if (request.priority === "low") {
    priorityMultiplier = 1.2;
    priorityLabel = "Standard queue background speed (+20%)";
  }

  const calculatedHours = Math.round(baseHours * volumeMultiplier * priorityMultiplier);
  const createdDate = new Date(request.createdAt);
  const estimatedCompletionDate = new Date(createdDate.getTime() + calculatedHours * 60 * 60 * 1000);

  return (
    <div className="space-y-8 animate-slide-up pb-16">
      
      {/* COMPACT TOP ROW SECTION */}
      <div className="flex items-center justify-between border-b border-[#E5E5E3] pb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/requests")}
            className="p-1.5 rounded-lg border border-[#E5E5E3] hover:bg-[#F9F9F7] text-[#555555] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#111111]">
              Request <span className="font-mono text-[#555555]">#{request.id}</span>
            </h2>
          </div>
        </div>

        {/* STATUS STAGE TOGGLE SYSTEM */}
        <div className="flex items-center gap-2 select-none">
          <StatusBadge value={request.status} />
        </div>
      </div>

      {/* FLAT CURRENT STATUS SECTION - CHANGE 1 */}
      {status !== "cancelled" ? (
        <div className="flex items-center justify-between py-4 select-none">
          <div>
            <span className="block text-xs uppercase text-[#999999] font-bold tracking-wider">CURRENT STATUS</span>
            <span className="block text-base font-semibold text-[#111111] mt-1 capitalize">
              {(WORKFLOW_STAGES.find((s) => s.value === request.status)?.label || request.status.replace(/_/g, " ")).replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>

          <div className="relative inline-block">
            <select
              value={status}
              disabled={updateMutation.isPending}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full disabled:cursor-not-allowed"
            >
              {WORKFLOW_STAGES.map((stg) => (
                <option key={stg.value} value={stg.value}>
                  {stg.label}
                </option>
              ))}
            </select>
            <button 
              disabled={updateMutation.isPending}
              className="h-[38px] px-3.5 bg-white border border-[#E5E5E3] rounded-lg text-[13px] font-medium text-[#111111] hover:bg-[#F9F9F7] flex items-center gap-1.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending && (
                <div className="w-3 h-3 border border-neutral-300 border-t-black rounded-full animate-spin mr-0.5 shrink-0" />
              )}
              <span>{updateMutation.isPending ? "Updating state..." : "Update status"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#555555] shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between py-4 select-none animate-slide-up">
          <div>
            <span className="block text-xs uppercase text-[#555555] font-bold tracking-wider">CURRENT STATUS</span>
            <span className="block text-base font-semibold text-[#333333] mt-1 uppercase">
              Cancelled
            </span>
          </div>

          <button
            onClick={handleUncancelRequest}
            disabled={updateMutation.isPending}
            className="h-[38px] px-4 bg-[#111111] hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          >
            {updateMutation.isPending && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            )}
            <span>Restore / Uncancel Request</span>
          </button>
        </div>
      )}

      {/* 1px horizontal divider */}
      <div className="border-b border-[#E5E5E3]" />

      {/* ESTIMATED COMPLETION TIME BLOCK - CHANGE 2 */}
      {status !== "cancelled" && status !== "completed" && (
        <section className="pt-6 space-y-4" aria-label="Target Delivery Projection">
          <h3 className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#999999]" id="admin-completion-schedule-title">
            COMPLETION SCHEDULE
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Cell 1 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#999999]">TARGET DATE</span>
              <span className="block text-[14px] font-semibold text-[#111111]">
                {estimatedCompletionDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })} at {estimatedCompletionDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <p className="text-[13px] text-[#555555] leading-normal">
                {calculatedHours} hours (~{Math.ceil(calculatedHours / 24)} business days) total turnaround from original submission time
              </p>
            </div>

            {/* Cell 2 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#999999]">CATEGORY</span>
              <span className="block text-[14px] font-semibold text-[#111111]">
                {categoryLabel}
              </span>
              <p className="text-[13px] text-[#555555] leading-normal">
                {baseHours}-hour standard turnaround
              </p>
            </div>

            {/* Cell 3 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#999999]">CURRENT LOAD</span>
              <span className="block text-[14px] font-semibold text-[#111111]">
                {activeRequestsCount} Active Requests
              </span>
              <p className="text-[13px] text-[#555555] leading-normal">
                {volumeStatus === "Low Volume (Optimal)" ? "Low volume on track" : `${volumeStatus} ${volumeDesc}`}
              </p>
            </div>

            {/* Cell 4 */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#999999]">PRIORITY</span>
              <span className="block text-[14px] font-semibold text-[#111111] capitalize">
                {request.priority}
              </span>
              <p className="text-[13px] text-[#555555] leading-normal">
                {priorityLabel}
              </p>
            </div>
          </div>

          <div className="border-b border-[#E5E5E3] pt-6" />
        </section>
      )}

      {/* CORE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO-THIRDS: MAIN CONTROLS */}
        <div className="lg:col-span-2 space-y-8 divide-y divide-[#E5E5E3]">
 
          {/* SECTION 1: QUOTE BUILDER */}
          <section className="space-y-4 pt-2">
            <h3 className="block text-xs font-bold uppercase tracking-wider text-[#999999]" id="quote-builder-title">
              QUOTE BUILDER
            </h3>

            {request.status === "quote_sent" && (
              <div className="p-3.5 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">QUOTE SENT TO STUDENT</span>
                    <span className="text-[11px] text-blue-700 font-medium">Awaiting Student response. You can refine and re-send the quote below.</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 font-semibold uppercase tracking-wider shrink-0 self-start sm:self-auto">
                  Active Proposal
                </span>
              </div>
            )}

            {quoteApproved && (
              <div className="p-3.5 bg-green-50 border-l-4 border-green-500 rounded-lg text-xs text-green-900 flex items-center justify-between animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block font-sans">QUOTE APPROVED BY STUDENT</span>
                    <span className="text-[11px] text-green-700 font-medium">Pricing finalized. The student approved the proposal of MUR {request.totalCost}.</span>
                  </div>
                </div>
                <span className="text-[11px] bg-white text-green-800 px-2.5 py-1 rounded-full border border-green-200 font-extrabold font-mono">
                  MUR {request.totalCost || 0}
                </span>
              </div>
            )}

            {quoteDeclined && (
              <div className="p-3.5 bg-rose-50 border-l-4 border-rose-500 rounded-lg text-xs text-rose-900 flex items-center justify-between animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block font-sans">QUOTE DECLINED BY STUDENT</span>
                    <span className="text-[11px] text-rose-700 font-medium">
                      The student declined the proposal of MUR {request.totalCost || 0}.
                      {request.cancelReason && (
                        <span className="block mt-0.5 font-semibold text-rose-800">Reason: {request.cancelReason}</span>
                      )}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] bg-white text-rose-800 px-2.5 py-1 rounded-full border border-rose-200 font-extrabold font-mono">
                  MUR {request.totalCost || 0}
                </span>
              </div>
            )}
 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-[#999999] mb-1.5">
                  Provider cost (MUR)
                </label>
                <input
                  type="number"
                  value={providerCost}
                  disabled={request.status !== "submitted" && request.status !== "under_review" && request.status !== "quote_sent"}
                  onChange={(e) => setProviderCost(Number(e.target.value))}
                  placeholder="e.g. 800"
                  className="w-full h-10 px-3 border border-[#E5E5E3] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-black font-semibold disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed"
                />
              </div>
 
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-[#999999] mb-1.5">
                  Service charge (MUR)
                </label>
                <input
                  type="number"
                  value={serviceCharge}
                  disabled={request.status !== "submitted" && request.status !== "under_review" && request.status !== "quote_sent"}
                  onChange={(e) => setServiceCharge(Number(e.target.value))}
                  placeholder="e.g. 200"
                  className="w-full h-10 px-3 border border-[#E5E5E3] rounded-lg text-sm text-[#111111] focus:outline-none focus:border-black font-semibold disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
 
            {/* Total invoice box details */}
            <div className="py-2.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#999999]">Computed Total</span>
                <p className="text-xl font-bold font-sans text-[#111111]">MUR {totalCalculated.toLocaleString()}</p>
              </div>
 
              {(request.status === "submitted" || request.status === "under_review" || request.status === "quote_sent") && (
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={handleSendQuote}
                  className="h-10 px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  ) : (
                    <Send className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {updateMutation.isPending 
                      ? "Sending pricing..." 
                      : request.status === "quote_sent" 
                        ? "Update & Re-send Quote" 
                        : "Send quote to student"}
                  </span>
                </button>
              )}
            </div>
          </section>
 
          {/* SECTION 2: ASSIGN PROVIDER */}
          <section className="space-y-3 pt-6">
            <h3 className="block text-xs font-bold uppercase tracking-wider text-[#999999]" id="assign-provider-title">
              ASSIGN PROVIDER
            </h3>
 
            {providersLoading ? (
              <Skeleton width="100%" height="40px" />
            ) : (
              <div className="relative">
                <select
                  value={providerId}
                  disabled={request.status === "cancelled"}
                  onChange={(e) => handleAssignProvider(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 bg-white border border-[#E5E5E3] rounded-lg text-xs font-semibold text-[#111111] focus:outline-none focus:border-black appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">No provider assigned</option>
                  {providers?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} Specialties: {p.specialty.join(", ")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#999999] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </section>
 
          {/* SECTION 3: OPERATOR NOTES (VISIBLE TO STUDENT) */}
          <section className="space-y-3.5 pt-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="block text-xs font-bold uppercase tracking-wider text-[#999999]">
                OPERATOR NOTES
              </h3>
              <div className="flex items-center gap-1 bg-[#F1F2E9] border border-[#E5E5E3] text-[#111111] px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono">
                <Unlock className="w-3 h-3 text-[#111111]" />
                <span>Visible to student</span>
              </div>
            </div>
 
            <textarea
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              disabled={request.status === "cancelled"}
              placeholder="Add notes for the student here..."
              rows={3}
              className="w-full p-3 bg-white border border-[#E5E5E3] rounded-lg text-xs leading-relaxed focus:outline-none focus:border-black disabled:opacity-60 disabled:cursor-not-allowed"
            />
            
            {request.status !== "cancelled" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="h-8 px-4 bg-white border border-[#E5E5E3] hover:bg-[#F9F9F7] text-[#111111] font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                >
                  Save note
                </button>
              </div>
            )}
          </section>
 
          {/* SECTION 4: PRIVATE NOTES (SECRET LOCK BOX) */}
          <section className="space-y-3.5 pt-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="block text-xs font-bold uppercase tracking-wider text-[#999999]">
                PRIVATE NOTES
              </h3>
              <div className="flex items-center gap-1 bg-[#F1F2E9] border border-[#E5E5E3] text-[#111111] px-2 py-0.5 rounded text-[10px] font-medium uppercase font-mono">
                <Lock className="w-3 h-3 text-[#111111]" />
                <span>Private Console Note</span>
              </div>
            </div>
 
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              disabled={request.status === "cancelled"}
              placeholder="e.g. Provider charged 1,800 MUR, profit made on student collection is 200..."
              rows={2}
              className="w-full p-3 bg-[#F9F9F7] border border-[#E5E5E3] rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:border-black disabled:opacity-60 disabled:cursor-not-allowed"
            />
 
            {request.status !== "cancelled" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveInternalNotes}
                  className="h-8 px-4 bg-white border border-[#E5E5E3] hover:bg-[#F9F9F7] text-[#111111] font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </section>
 
          {/* SECTION 5: ADMIN ORDER CANCELLATION */}
          <section className="space-y-3.5 pt-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="block text-xs font-bold uppercase tracking-wider text-[#999999]">
                CANCEL JOB ORDER (ADMIN ONLY)
              </h3>
              <span className="bg-[#F1F2E9] text-[#111111] border border-[#E5E5E3] text-[10px] font-medium uppercase px-2 py-0.5 rounded font-mono">
                Mandatory Reason Block
              </span>
            </div>
 
            {request.status === "cancelled" ? (
              <div className="p-4 bg-[#F1F2E9] border border-[#E5E5E3] text-[#111111] rounded-lg text-xs space-y-1 animate-slide-up">
                <p className="font-semibold">This job has already been cancelled.</p>
                {request.cancelReason && (
                  <p>
                    <span className="font-semibold">Reason provided:</span> {request.cancelReason}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 leading-normal">
                  Cancelling an order is irreversible. The customer will be immediately notified on their portal along with the reason you provide below.
                </p>
 
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-[#999999] mb-1">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                     value={cancelReasonText}
                     onChange={(e) => setCancelReasonText(e.target.value)}
                     placeholder="Provide a clear explanation for the student (e.g. Parts currently unavailable / Item beyond economical repair)..."
                     rows={2}
                     className="w-full p-3 bg-white border border-[#E5E5E3] rounded-lg text-xs focus:outline-none focus:border-black transition"
                  />
                </div>
 
                {showAdminCancelConfirm ? (
                  <div className="bg-[#FAF9F6] border border-red-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left w-full animate-slide-up">
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Confirm Cancellation</p>
                      <p className="text-[11px] text-[#555555] mt-0.5">Are you sure? This action is permanent and cannot be reversed.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAdminCancelConfirm(false)}
                        className="h-8 px-3 bg-white border border-[#E5E5E3] hover:bg-[#F7F7F5] text-[#555555] font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                      >
                        Keep Request
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateMutation.mutate(
                            { status: "cancelled", cancelReason: cancelReasonText },
                            {
                              onSuccess: () => {
                                setStatus("cancelled");
                                setShowAdminCancelConfirm(false);
                                addToast("Order has been successfully cancelled with reason.", "success");
                              }
                            }
                          );
                        }}
                        disabled={updateMutation.isPending}
                        className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                      >
                        {updateMutation.isPending ? "Cancelling..." : "Yes, Cancel Order"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!cancelReasonText.trim()) {
                          addToast("You must provide a cancellation reason first.", "error");
                          return;
                        }
                        setShowAdminCancelConfirm(true);
                      }}
                      className="h-9 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
 
          {/* GIANT BOTTOM UTILITY CARD CREATION BUTTON */}
          {request.status !== "cancelled" && (
            <div className="pt-6">
              <button
                onClick={() => setProviderModalOpen(true)}
                className="w-full h-11 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition animate-fade-in"
                id="generate-provider-card-btn"
              >
                <span>Generate provider card</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Admin: Permanent delete control */}
          <div className="pt-4">
            {showDeleteConfirm ? (
              <div className="bg-[#FFF6F6] border border-red-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left w-full animate-slide-up">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Confirm Permanent Deletion</p>
                  <p className="text-[11px] text-[#555555] mt-0.5">This will permanently remove this request from the system and cannot be undone. The student will no longer see this order.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-8 px-3 bg-white border border-[#E5E5E3] hover:bg-[#F7F7F5] text-[#555555] font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                  >
                    Keep Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!request || !request.id) return;
                      deleteMutation.mutate(request.id, {
                        onSuccess: () => {
                          addToast("Request permanently deleted.", "success");
                          navigate("/admin/requests");
                        },
                      });
                    }}
                    disabled={deleteMutation.isPending}
                    className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Yes, Delete Permanently"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-9 px-4 bg-white border border-red-600 hover:bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            )}
          </div>
 
        </div>

        {/* RIGHT ONE-THIRD: ORIGINAL STUDENT DEMANDS */}
        <div className="space-y-6">
          <div className="space-y-4 sticky top-6">
            <h3 className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#555555] border-b border-[#E5E5E3] pb-2">
              ORIGINAL JOB CLAIMS
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Student Name</span>
                <p className="text-sm font-bold text-black mt-0.5">{request.studentName}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Student Email</span>
                <p className="text-xs font-semibold text-[#555555] mt-0.5">{request.studentEmail}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Student Phone</span>
                <p className="text-xs font-semibold text-[#555555] mt-0.5">{request.studentPhone || "Not provided"}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Student ID</span>
                <p className="text-xs font-semibold text-[#555555] mt-0.5">{request.studentId}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Submitted</span>
                <p className="text-xs font-semibold text-[#555555] mt-0.5">{new Date(request.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Category & Priority</span>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-bold uppercase bg-neutral-50 border border-[#E5E5E3] px-2 py-0.5 rounded flex items-center gap-1.5 leading-none text-[#555555]">
                    <IconComponent className="w-3 h-3 text-black shrink-0" />
                    <span>{request.category}</span>
                  </span>
                  <PriorityBadge value={request.priority} />
                </div>
              </div>

              {(request.brand || request.model || request.accessoryType || request.issues.length > 0 || request.customIssue) && (
                <div>
                  <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Guided Request Summary</span>
                  <div className="space-y-2 text-xs text-[#555555] mt-1.5">
                    {request.accessoryType && (
                      <div>
                        <span className="font-semibold text-[#111111]">Accessory Type:</span> {request.accessoryType}
                      </div>
                    )}
                    {request.brand && (
                      <div>
                        <span className="font-semibold text-[#111111]">Brand:</span> {request.brand}
                      </div>
                    )}
                    {request.model && (
                      <div>
                        <span className="font-semibold text-[#111111]">Model:</span> {request.model}
                      </div>
                    )}
                    {request.issues.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#111111]">Selected Issues:</span> {request.issues.join(", ")}
                      </div>
                    )}
                    {request.customIssue && (
                      <div>
                        <span className="font-semibold text-[#111111]">Additional Issue:</span> {request.customIssue}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Student Claims</span>
                <p className="text-xs text-[#111111] leading-relaxed mt-1.5 whitespace-pre-wrap bg-[#F9F9F7] p-3 border border-[#E5E5E3] rounded-lg">
                  {request.description}
                </p>
              </div>

              {request.additionalNotes && (
                <div>
                  <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Contact Notes</span>
                  <p className="text-xs text-[#555555] leading-relaxed mt-1 whitespace-pre-wrap select-text italic">
                    "{request.additionalNotes}"
                  </p>
                </div>
              )}

              {request.photos && request.photos.length > 0 && (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="block text-[9px] font-bold text-[#999999] uppercase tracking-wider">Claims Photos</span>
                    <span className="text-[8px] font-mono font-medium text-neutral-400">Click to expand & download</span>
                  </div>
                  <div className="flex gap-2.5 mt-2 flex-wrap animate-fade-in">
                    {request.photos.map((ph, pi) => (
                      <div 
                        key={pi} 
                        className="group relative w-16 h-16 rounded-lg border border-[#E5E5E3] overflow-hidden bg-[#F5F5F3] cursor-pointer hover:border-black transition duration-250 select-none shadow-sm"
                        onClick={() => setExpandedImage(ph)}
                        title="Zoom Claim Photo"
                      >
                        <img src={ph} alt="visual claim item" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-[9px] text-white font-extrabold uppercase tracking-wide">Zoom</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* REPAIR PROVIDER COMPONENT POPUP CARD */}
      {providerModalOpen && (
        <div
          onClick={() => setProviderModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-xl border border-[#E5E5E3] overflow-hidden flex flex-col cursor-default shadow-2xl animate-slide-up"
          >
            {/* Header */}
            <div className="bg-[#111111] text-white p-4.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider">Creole Job Specs</h3>
              <button
                onClick={() => setProviderModalOpen(false)}
                className="text-white/70 hover:text-white rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content form */}
            <div className="p-6 space-y-4">
              <div className="bg-[#F1F2E9] border border-[#E5E5E3] p-3 rounded-lg flex gap-2">
                <Bookmark className="w-4 h-4 text-[#111111] shrink-0 mt-0.5 font-bold" />
                <p className="text-[10px] text-[#111111] leading-tight">
                  Transcribe claims into Creole specs before screenshots or printing for Port Louis technicians.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-[#999999] mb-1.5">
                  Translation/Creole Specs
                </label>
                <textarea
                  value={provTranslate}
                  onChange={(e) => setProvTranslate(e.target.value)}
                  placeholder="e.g. Ranplase batri avek LCD ecran. Pa fer dimal bri tactile..."
                  rows={4}
                  className="w-full p-2.5 bg-white border border-[#E5E5E3] rounded-lg text-xs leading-relaxed focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.05em] text-[#999999] mb-1.5">
                  Agreed Provider Fee (MUR)
                </label>
                <input
                  type="number"
                  value={providerCost}
                  onChange={(e) => setProviderCost(Number(e.target.value))}
                  className="w-full h-10 px-3 border border-[#E5E5E3] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveAllAndCloseCard}
                  className="flex-1 h-10 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                >
                  Save & Open Card
                </button>
                <button
                  type="button"
                  onClick={() => setProviderModalOpen(false)}
                  className="h-10 px-4 bg-white border border-[#E5E5E3] hover:bg-[#F9F9F7] font-bold text-[10px] uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX ACCENT */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 cursor-pointer select-none animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-2xl w-full flex flex-col gap-3 cursor-default"
          >
            {/* Close */}
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>

            {/* Img frame */}
            <div className="bg-white p-2.5 rounded-xl border border-neutral-800 shadow-2xl overflow-hidden max-h-[70vh] flex items-center justify-center">
              <img src={expandedImage} alt="Expanded visual snapshot" className="max-w-full max-h-[65vh] object-contain rounded-lg" referrerPolicy="no-referrer" />
            </div>

            {/* Actions panel */}
            <div className="flex justify-between items-center px-1.5">
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#CCCCCC]">
                Repair Claim Snapshot • Request #{id}
              </p>
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = expandedImage;
                  link.download = `cloova_claim_${id}_photo.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  addToast("Photo download started!", "success");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-100 text-black font-semibold text-[10px] uppercase tracking-wider rounded-lg shadow-xl cursor-safe transition"
              >
                <span>Download Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
