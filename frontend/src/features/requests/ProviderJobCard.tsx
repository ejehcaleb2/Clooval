/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useRequest } from "../../hooks/queries";
import { CATEGORY_ICONS } from "./StudentHome";
import Skeleton from "../../components/ui/Skeleton";
import { HelpCircle, Phone, HeartHandshake, AlertTriangle, Printer, ExternalLink, ShieldCheck } from "lucide-react";

export default function ProviderJobCard() {
  const { requestId } = useParams<{ requestId: string }>();

  const { data: request, isLoading, error } = useRequest(requestId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white border border-[#E5E5E3] rounded-lg p-8 space-y-6 text-center">
          <Skeleton width="64px" height="64px" className="mx-auto" borderRadius="100%" />
          <Skeleton width="180px" height="24px" className="mx-auto" />
          <Skeleton width="100%" height="80px" />
          <Skeleton width="140px" height="30px" className="mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-[400px] bg-white border border-red-200 rounded-lg p-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-[#E74C3C] mx-auto" />
          <h3 className="text-lg font-bold text-black">Job Card Not Found</h3>
          <p className="text-sm text-[#555555]">
            This request doesn't exist or is not available publicly anymore.
          </p>
        </div>
      </div>
    );
  }

  const IconComponent = CATEGORY_ICONS[request.category] || HelpCircle;

  // Print handle
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center justify-center p-4 md:py-8 print:bg-white select-none">
      {/* SCREENSHOT ACTION COMPONENT - Hidden in prints */}
      <div className="w-full max-w-[400px] mb-4 flex justify-between items-center text-xs text-[#555555] print:hidden">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#555555] flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-[#27AE60]" /> Shareable Ticket
        </span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 text-[#111111] hover:underline font-semibold uppercase tracking-wider cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 shrink-0" />
          <span>Screenshot / Print</span>
        </button>
      </div>

      {/* CORE SCREENSHOT-SWEET CARD */}
      <div className="w-full max-w-[400px] bg-white border-2 border-[#111111] rounded-lg p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] space-y-6 text-center print:border-none print:shadow-none">
        {/* Large category Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center border-4 border-white shadow-[0_0_0_1px_#111111] shrink-0">
          <IconComponent className="w-8 h-8 font-bold" />
        </div>

        {/* Labels info */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999] bg-[#F7F7F5] px-2.5 py-1 rounded border border-[#E5E5E3]">
            ID: {request.id}
          </span>
          <h2 className="text-xl font-bold text-[#111111] pt-1 uppercase tracking-tight">
            {request.category} Repair
          </h2>
        </div>

        {/* PROMINENT DEVICE PHOTOS */}
        {request.photos && request.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            {request.photos.slice(0, 2).map((photo, pIdx) => (
              <div
                key={pIdx}
                className={`border border-[#111111] rounded-md overflow-hidden aspect-square ${
                  request.photos.length === 1 ? "col-span-2 aspect-[4/3]" : ""
                }`}
              >
                <img
                  src={photo}
                  alt={`Device visual index ${pIdx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* DESCRIPTION SPECS - LARGE TYPEFACE FOR LOCAL MECHANICS */}
        <div className="border-t border-[#E5E5E3] pt-6 text-left space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#555555]">
            DESCRIPTION DETAY / DETAILS
          </span>
          <p className="text-[15px] font-semibold text-[#111111] leading-relaxed whitespace-pre-wrap">
            {request.providerTranslation || request.description}
          </p>
        </div>

        {/* AGREED FEE BOX */}
        <div className="p-4 bg-[#F7F7F5] border border-[#111111] rounded-lg text-center space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555555]">
            PRIX ACCORDÉ / AGREED PRICE
          </span>
          <p className="text-3xl font-mono font-bold text-[#111111]">
            MUR {request.providerCost || "---"}
          </p>
        </div>

        {/* CONTACT BOTTOM ROW */}
        <div className="border-t border-[#E5E5E3] pt-5 text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">
            OPERATOR / CONTACT CALEB
          </span>
          <p className="text-base font-semibold text-[#111111] flex items-center justify-center gap-1.5">
            <Phone className="w-4 h-4 shrink-0 text-[#111111]" />
            <span className="font-mono">+230 5111 2233</span>
          </p>
        </div>
      </div>
    </div>
  );
}
