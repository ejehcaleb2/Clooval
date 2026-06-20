/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuthStore, useToastStore } from "../../lib/store";
import { User as UserIcon, ShieldAlert, Key, Bell, Settings, LogOut, Check, X, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized with user state values or defaults
  const [name, setName] = useState(user?.name || "");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [resident, setResident] = useState(user?.resident || "Maps");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [programmeOfStudy, setProgrammeOfStudy] = useState(user?.programmeOfStudy || "");
  
  // Notification Preferences states
  const [notificationEmail, setNotificationEmail] = useState(user?.notificationEmail ?? true);
  const [notificationSMS, setNotificationSMS] = useState(user?.notificationSMS ?? true);
  const [notificationInApp, setNotificationInApp] = useState(user?.notificationInApp ?? true);

  const handleLoggedOut = () => {
    logout();
    addToast("Logged out of Cloova successfully", "success");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Full Name is required.", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name,
        studentId,
        phone,
        resident,
        nationality,
        programmeOfStudy,
        notificationEmail,
        notificationSMS,
        notificationInApp
      };
      
      const res = await api.patch("/api/auth/profile", payload);
      
      // Update both store state variables
      updateUser(res.data);
      
      // Save updated user to local sync replication structure as well
      const localUsers = JSON.parse(localStorage.getItem("cl_custom_accounts") || "[]");
      const matchedIdx = localUsers.findIndex((u: any) => u.email.toLowerCase() === res.data.email.toLowerCase());
      if (matchedIdx !== -1) {
        localUsers[matchedIdx] = { ...localUsers[matchedIdx], ...res.data };
        localStorage.setItem("cl_custom_accounts", JSON.stringify(localUsers));
      }
      
      addToast("Your profile and notification preferences have been saved successfully!", "success");
      setIsEditing(false);
    } catch (err: any) {
      addToast(err.response?.data?.error || err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b border-[#E5E5E3] pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#111111]">Student Profile</h2>
          <p className="text-sm text-[#555555] mt-0.5">Your ALU Mauritius account and notification preferences.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition duration-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isSaving ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" label="Saving Cloova Account Preferences..." />
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white border border-[#E5E5E3] rounded-xl p-5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] rounded-lg text-xs font-medium focus:outline-none focus:border-black transition"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Student ID Number
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] rounded-lg text-xs font-medium focus:outline-none focus:border-black transition"
                  placeholder="e.g. ALU-2025-084"
                />
              </div>

              {/* Email (Read Only Constraint) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Student Email (ALU Registered - View Only)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 h-10 border border-neutral-200 bg-neutral-50 text-neutral-400 rounded-lg text-xs font-medium cursor-not-allowed select-all"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  WhatsApp Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] rounded-lg text-xs font-medium focus:outline-none focus:border-black transition"
                  placeholder="e.g. +230 5123 4567"
                />
              </div>

              {/* Residence Dropdown */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Residence Hall
                </label>
                <select
                  value={resident}
                  onChange={(e) => setResident(e.target.value as any)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] bg-white rounded-lg text-xs font-medium focus:outline-none focus:border-black transition"
                >
                  <option value="Maps">Maps Residence (Grand Baie)</option>
                  <option value="Songhai">Songhai Residence</option>
                  <option value="Aksum">Aksum Residence</option>
                </select>
              </div>

              {/* Nationality */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] rounded-lg text-xs font-medium focus:outline-none focus:border-black transition"
                  placeholder="e.g. Rwandan"
                />
              </div>

              {/* Programme of study */}
              <div className="space-y-1 md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Programme of Study
                </label>
                <input
                  type="text"
                  value={programmeOfStudy}
                  onChange={(e) => setProgrammeOfStudy(e.target.value)}
                  className="w-full px-3 h-10 border border-[#E5E5E3] rounded-lg text-xs font-medium"
                  placeholder="e.g. BSc (Hons) Software Engineering"
                />
              </div>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES SECTION */}
          <div className="bg-white border border-[#E5E5E3] rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Communication Preferences</span>
            </h3>

            <div className="space-y-3.5 pt-1">
              {/* Email Switcher */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black shrink-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-neutral-800">Email Alerts</span>
                  <span className="block text-[10.5px] text-neutral-500 leading-normal font-medium">
                    Send quotation links, deposit invoices, and final pickup notices to my ALU inbox.
                  </span>
                </div>
              </label>

              {/* SMS status Updates */}
              <label className="flex items-start gap-3 cursor-pointer select-none border-t border-neutral-50 pt-3">
                <input
                  type="checkbox"
                  checked={notificationSMS}
                  onChange={(e) => setNotificationSMS(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black shrink-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-neutral-800">WhatsApp / SMS Dispatch Notes</span>
                  <span className="block text-[10.5px] text-neutral-500 leading-normal font-medium">
                    Deliver instant automated notes containing locker PINs and urgent provider concerns directly to my cell phone.
                  </span>
                </div>
              </label>

              {/* In app updates */}
              <label className="flex items-start gap-3 cursor-pointer select-none border-t border-neutral-50 pt-3">
                <input
                  type="checkbox"
                  checked={notificationInApp}
                  onChange={(e) => setNotificationInApp(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black shrink-0 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-neutral-800">In-App Push Feed</span>
                  <span className="block text-[10.5px] text-neutral-500 leading-normal font-medium">
                    Flash urgent notifications directly inside my user dashboard when in online mode.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => {
                // Revert states
                setName(user?.name || "");
                setStudentId(user?.studentId || "");
                setPhone(user?.phone || "");
                setResident(user?.resident || "Maps");
                setNationality(user?.nationality || "");
                setProgrammeOfStudy(user?.programmeOfStudy || "");
                setNotificationEmail(user?.notificationEmail ?? true);
                setNotificationSMS(user?.notificationSMS ?? true);
                setNotificationInApp(user?.notificationInApp ?? true);
                setIsEditing(false);
              }}
              className="px-4 h-10 border border-[#E5E5E3] hover:bg-neutral-50 rounded-lg text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 h-10 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition"
            >
              Save Preferences
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* CREDENTIALS VIEW DISPLAY */}
          <div className="py-6 border border-[#E5E5E3] bg-white rounded-xl px-5 grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-left">
            <div className="md:col-span-2 flex items-center gap-4 text-left border-b border-neutral-100 pb-4">
              <div className="w-14 h-14 bg-black text-white font-serif text-lg rounded-full flex items-center justify-center shrink-0 border border-[#E5E5E3]">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "A"}
              </div>
              <div className="space-y-0.5 truncate flex-1 text-left">
                <h3 className="text-[17px] font-semibold text-[#111111] leading-tight truncate">
                  {user?.name || "Amara Diop"}
                </h3>
                <p className="text-xs font-medium text-[#555555] truncate mt-0.5">{user?.email}</p>
                <div className="flex gap-2 items-center flex-wrap pt-0.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    ID: {user?.studentId || "N/A"}
                  </span>
                  <span className="text-[10px] font-semibold text-white bg-black uppercase tracking-[0.05em] px-2 py-0.5 rounded leading-none flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{user?.role || "STUDENT"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Blocks */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Residence Placement</span>
              <span className="block text-xs font-bold text-neutral-800">{user?.resident || "Unassigned"} Residence</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Contact Phone / WhatsApp</span>
              <span className="block text-xs font-bold text-neutral-800 font-mono">{user?.phone || "No phone linked"}</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Nationality</span>
              <span className="block text-xs font-bold text-neutral-800">{user?.nationality || "Not specified"}</span>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Programme of Study</span>
              <span className="block text-xs font-bold text-neutral-800">{user?.programmeOfStudy || "Not specified"}</span>
            </div>
          </div>

          {/* ACTIVE DISPATCH SETTINGS VIEW */}
          <div className="border border-[#E5E5E3] bg-white rounded-xl p-5 space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>System Communication Channels</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3 border border-neutral-100 rounded-lg space-y-1 text-left bg-neutral-50/50">
                <span className="block text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">Email Alerts</span>
                <span className={`text-xs font-bold uppercase tracking-wider block ${user?.notificationEmail !== false ? "text-emerald-600" : "text-neutral-400"}`}>
                  {user?.notificationEmail !== false ? "● Active" : "○ Disabled"}
                </span>
              </div>

              <div className="p-3 border border-neutral-100 rounded-lg space-y-1 text-left bg-neutral-50/50">
                <span className="block text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">WhatsApp Status</span>
                <span className={`text-xs font-bold uppercase tracking-wider block ${user?.notificationSMS !== false ? "text-emerald-600" : "text-neutral-400"}`}>
                  {user?.notificationSMS !== false ? "● Active" : "○ Disabled"}
                </span>
              </div>

              <div className="p-3 border border-neutral-100 rounded-lg space-y-1 text-left bg-neutral-50/50">
                <span className="block text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">In-App Push</span>
                <span className={`text-xs font-bold uppercase tracking-wider block ${user?.notificationInApp !== false ? "text-emerald-600" : "text-neutral-400"}`}>
                  {user?.notificationInApp !== false ? "● Active" : "○ Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* ACCOUNT MENU SETTING */}
          <section className="space-y-2">
            <h3 className="block text-xs font-semibold uppercase tracking-[0.05em] text-[#555555] border-b border-[#E5E5E3] pb-2 text-left">
              Account options
            </h3>

            <div className="divide-y divide-[#E5E5E3]">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full text-left py-4 flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg cursor-pointer transition text-sm font-medium"
              >
                <span className="text-[#111111]">Edit Profile</span>
                <Settings className="w-4 h-4 text-[#999999]" />
              </button>

              <button
                onClick={handleLoggedOut}
                className="w-full text-left py-4 flex items-center justify-between hover:bg-[#F7F7F5] px-2 rounded-lg cursor-pointer transition text-sm font-semibold text-[#111111]"
                id="logout-btn"
              >
                <span>Log Out</span>
                <LogOut className="w-4 h-4 text-[#555555]" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
