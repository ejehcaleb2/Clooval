/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sliders, Shield, RefreshCw, Database, Info, Check } from "lucide-react";
import { useToastStore } from "../../lib/store";

export default function AdminSettings() {
  const { addToast } = useToastStore();

  const handleSave = () => {
    addToast("Configurations saved successfully", "success");
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#111111]">Console Settings</h2>
        <p className="text-sm text-[#555555] mt-0.5">Configure system parameters, routing rules, and local currency thresholds.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Core settings */}
        <div className="divide-y divide-[#E5E5E3] border-t border-b border-[#E5E5E3]">
          <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                <Database className="w-4 h-4" /> Relational Database Cache
              </span>
              <p className="text-xs text-[#555555]">Enable client-side React Query optimization caching for instant transitions.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-[#E5E5E3] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E5E3] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                <Shield className="w-4 h-4" /> Cloova Escrow Mode
              </span>
              <p className="text-xs text-[#555555]">Require manual operator lockbox PIN verification before a job is ready for collection.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-[#E5E5E3] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E5E3] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Category Surcharge (MUR)
              </span>
              <p className="text-xs text-[#555555]">Set default Mauritius service markup charges across repair item categories.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={200}
                className="w-24 h-9 px-3 border border-[#E5E5E3] bg-[#FAF9F6] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-black"
              />
              <span className="text-xs text-[#555555]">MUR</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            type="button"
            className="h-10 px-6 bg-[#111111] hover:bg-[#333333] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Configurations</span>
          </button>
        </div>
      </div>
    </div>
  );
}
