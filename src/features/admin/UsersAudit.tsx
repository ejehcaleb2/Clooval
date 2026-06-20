/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { 
  useAdminUsers, 
  useUpdateUser, 
  useSendCustomAlert, 
  useCreateRequest 
} from "../../hooks/queries";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  BookOpen, 
  Plus, 
  FileText, 
  Send, 
  ArrowRight, 
  Wrench, 
  Activity, 
  ShieldAlert, 
  Globe, 
  CheckCircle,
  HelpCircle,
  Clock,
  UserCheck,
  Edit2
} from "lucide-react";
import { StatusBadge } from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import { useToastStore } from "../../lib/store";

export default function UsersAudit() {
  const { addToast } = useToastStore();
  const { data: users, isLoading, error } = useAdminUsers();
  const updateUserMutation = useUpdateUser();
  const sendAlertMutation = useSendCustomAlert();
  const createRequestMutation = useCreateRequest();

  // Search, tabs and selections
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "activity" | "behalf">("profile");

  // Activity stream filter states
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityActionFilter, setActivityActionFilter] = useState("ALL");

  // User details modification state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editResident, setEditResident] = useState<"Maps" | "Songhai" | "Aksum" | "">("");
  const [editStudentId, setEditStudentId] = useState("");

  // Custom alert action states
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Behalf Request Dispatch state
  const [behalfCategory, setBehalfCategory] = useState<string>("phone");
  const [behalfDescription, setBehalfDescription] = useState("");
  const [behalfPriority, setBehalfPriority] = useState<string>("normal");
  const [behalfNotes, setBehalfNotes] = useState("");

  // Compute stats
  const totalUsers = users?.length || 0;
  const totalClaims = users?.reduce((acc, u) => acc + (u.requests?.length || 0), 0) || 0;
  const activeServiceUsers = users?.filter(u => u.requests && u.requests.some((r: any) => r.status !== "completed" && r.status !== "cancelled")).length || 0;

  // Selected object
  const selectedUser = users?.find(u => u.id === selectedUserId) || null;

  // Start edit details
  const startEditing = () => {
    if (!selectedUser) return;
    setEditName(selectedUser.name || "");
    setEditEmail(selectedUser.email || "");
    setEditPhone(selectedUser.phone || "");
    setEditResident(selectedUser.resident || "");
    setEditStudentId(selectedUser.studentId || "");
    setEditMode(true);
  };

  // Save modified user details
  const handleSaveDetails = () => {
    if (!selectedUser) return;
    if (!editName.trim() || !editEmail.trim()) {
      addToast("Full Name and Account Email are required fields.", "error");
      return;
    }

    updateUserMutation.mutate(
      {
        id: selectedUser.id,
        name: editName,
        email: editEmail,
        phone: editPhone,
        resident: editResident ? (editResident as "Maps" | "Songhai" | "Aksum") : undefined,
        studentId: editStudentId,
      },
      {
        onSuccess: () => {
          setEditMode(false);
          addToast("Student Profile details updated successfully!", "success");
        },
        onError: (err: any) => {
          const msg = err.response?.data?.error || "Failed to update profile info.";
          addToast(msg, "error");
        }
      }
    );
  };

  // Submit live custom notification
  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!alertTitle.trim() || !alertMessage.trim()) {
      addToast("Please provide both a Title and a Message for the notification checklist.", "error");
      return;
    }

    sendAlertMutation.mutate(
      {
        id: selectedUser.id,
        title: alertTitle,
        message: alertMessage,
      },
      {
        onSuccess: () => {
          setAlertTitle("");
          setAlertMessage("");
          addToast(`Custom system broadcast successfully pushed to ${selectedUser.name}!`, "success");
        },
        onError: (err: any) => {
          addToast(err.message || "Failed to broadcast message.", "error");
        }
      }
    );
  };

  // Dispatch claims on behalf of student
  const handleCreateOnBehalf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!behalfDescription.trim()) {
      addToast("A detailed description of the laptop/device issue is required.", "error");
      return;
    }

    createRequestMutation.mutate(
      {
        category: behalfCategory as any,
        description: behalfDescription,
        priority: behalfPriority as any,
        additionalNotes: behalfNotes,
        studentPhone: selectedUser.phone || "",
        behalfStudentId: selectedUser.id, // Specifying client-side flag matching backend
      } as any,
      {
        onSuccess: () => {
          setBehalfDescription("");
          setBehalfNotes("");
          addToast(`Repair Claim logged on behalf of ${selectedUser.name} successfully!`, "success");
        },
        onError: (err: any) => {
          addToast(err.message || "Failed to log claim on behalf.", "error");
        }
      }
    );
  };

  // Filters
  const filteredUsers = users?.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q) ||
      u.resident?.toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* HEADER SECTION WITH KEY PERFORMANCE COUNTERS */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E5E3] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">Student Footprint & Auditing Center</h2>
          <p className="text-xs text-[#555555] mt-1 font-medium">
            Search student accounts, view operational logs, update user records, and dispatch job claims directly on behalf of campus residents.
          </p>
        </div>

        {/* METRICS ROW */}
        <div className="flex gap-3 text-left">
          <div className="px-3.5 py-2 bg-white border border-[#E5E5E3] rounded-lg">
            <span className="block text-[8px] font-bold text-[#999999] uppercase tracking-wider">SYSTEM USERS</span>
            <span className="text-sm font-extrabold text-black font-mono leading-none">{totalUsers}</span>
          </div>
          <div className="px-3.5 py-2 bg-white border border-[#E5E5E3] rounded-lg">
            <span className="block text-[8px] font-bold text-[#999999] uppercase tracking-wider">TOTAL CLAIMS</span>
            <span className="text-sm font-extrabold text-black font-mono leading-none">{totalClaims}</span>
          </div>
          <div className="px-3.5 py-2 bg-white border border-[#E5E5E3] rounded-lg">
            <span className="block text-[8px] font-bold text-[#999999] uppercase tracking-wider">ACTIVE USERS</span>
            <span className="text-sm font-extrabold text-black font-mono leading-none">{activeServiceUsers}</span>
          </div>
        </div>
      </section>

      {/* THREE-PANEL SECTIONS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* PANEL 1: USER LIST DIRECTORY (2/5 size) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-4 pb-4">
            
            {/* SEARCH */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-[#999999]" />
              </span>
              <input
                type="text"
                placeholder="Search user, ID, email or hostel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 h-10 bg-[#FAF9F6] border border-[#E5E5E3] rounded-lg text-xs placeholder-[#999999] focus:outline-none focus:border-black transition font-medium"
              />
            </div>

            {/* DIRECTORY LISTING */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="p-3 border border-[#E5E5E3] rounded-lg">
                    <Skeleton width="120px" height="12px" />
                    <Skeleton width="180px" height="10px" className="mt-1.5" />
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="divide-y divide-[#F5F5F3] max-h-[580px] overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  const initials = u.name ? u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "ST";
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setEditMode(false);
                      }}
                      className={`p-3 flex items-center gap-3.5 transition cursor-pointer select-none rounded-lg ${
                        isSelected 
                          ? "bg-[#F3F2EE] border-l-[4px] border-[#111111] pl-2" 
                          : "hover:bg-[#FAF9F7]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#E5E5E3] flex items-center justify-center text-[11px] font-bold text-[#555555] shrink-0 uppercase select-none">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-black truncate leading-tight block">{u.name}</span>
                          <span className="text-[8px] font-bold bg-[#E5E5E3]/50 border border-[#E5E5E3] text-[#555555] px-1.5 py-0.5 rounded font-mono shrink-0 uppercase leading-none">
                            {u.resident || "Off"}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#777777] font-mono leading-tight truncate mt-0.5">{u.email}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-neutral-100 text-neutral-800 text-[10px] font-bold rounded-full font-mono border border-neutral-200">
                          {u.requests?.length || 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-[#E5E5E3] rounded-lg p-12 text-center">
                <ShieldAlert className="w-8 h-8 text-[#999999] mx-auto shrink-0 mb-2" />
                <p className="text-xs font-bold text-black">No User Profiles matched</p>
                <p className="text-[10px] text-[#999999] mt-0.5">Try widening or changing your query keywords.</p>
              </div>
            )}

          </div>
        </div>

        {/* PANEL 2: AUDIT DETAILS AND HIGH VALUE ACTIONS (3/5 size) */}
        <div className="lg:col-span-3 space-y-6">
          {selectedUser ? (
            <div className="space-y-6 pb-6">
              
              {/* INTERACTIVE ACTION TAB HEADING */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E3] pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shadow-sm uppercase shrink-0">
                    {selectedUser.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111111] uppercase tracking-tight leading-none mb-1">
                      {selectedUser.name}
                    </h3>
                    <p className="text-[10px] text-[#777777] font-mono font-bold leading-none">{selectedUser.email}</p>
                  </div>
                </div>

                {/* EDIT TOGGLES */}
                <div className="flex gap-2">
                  {!editMode ? (
                    <button
                      onClick={startEditing}
                      className="h-8 px-3 border border-[#E5E5E3] hover:border-black rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition cursor-pointer bg-[#FAF9F6]"
                    >
                      <Edit2 className="w-3 h-3 text-[#555555]" />
                      <span>Edit Account</span>
                    </button>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditMode(false)}
                        className="h-8 px-3 border border-[#E5E5E3] hover:bg-neutral-50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#555555] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveDetails}
                        className="h-8 px-3 bg-black hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILS FORM CARD (READ OR EDIT MODE) */}
              <div className="py-4 border-y border-[#E5E5E3] text-left space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#999999] border-b border-[#E5E5E3] pb-1.5 select-none text-left">
                  MANDATORY SYSTEM ACCOUNT SHIELDS
                </h4>

                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-tight text-[#999999]">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-tight text-[#999999]">Account Email</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-tight text-[#999999]">WhatsApp Phone</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-tight text-[#999999]">Campus Residency</label>
                      <select
                        value={editResident}
                        onChange={(e) => setEditResident(e.target.value as any)}
                        className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                      >
                        <option value="">Off Campus</option>
                        <option value="Maps">Maps Residence</option>
                        <option value="Songhai">Songhai Residence</option>
                        <option value="Aksum">Aksum Residence</option>
                      </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="block text-[9px] font-bold uppercase tracking-tight text-[#999999]">ALU Student ID</label>
                      <input
                        type="text"
                        value={editStudentId}
                        onChange={(e) => setEditStudentId(e.target.value)}
                        className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wide">University Resident ID:</span>
                      <p className="text-black font-mono">{selectedUser.studentId || "None assigned"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wide">Contact/WhatsApp Phone:</span>
                      <p className="text-black font-mono">{selectedUser.phone || "No phone connected"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wide">Primary Location Block:</span>
                      <p className="text-black">{selectedUser.resident ? `${selectedUser.resident} Hostel` : "Off-Campus resident"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wide">Nationality Passport:</span>
                      <p className="text-black capitalize">{selectedUser.nationality || "Not disclosed"}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <span className="block text-[8px] font-bold text-[#aaaaaa] uppercase tracking-wide">Academic Programme:</span>
                      <p className="text-black italic">{selectedUser.programmeOfStudy || "Engineering / General Academic Track"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION CATEGORIES SELECTOR MENU */}
              <div className="flex border-b border-[#E5E5E3]">
                {[
                  { value: "profile" as const, label: "All Registered Claims" },
                  { value: "activity" as const, label: "Chronological Logs" },
                  { value: "behalf" as const, label: "Action & Command Hub" },
                ].map((tb) => (
                  <button
                    key={tb.value}
                    onClick={() => setActiveTab(tb.value)}
                    className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-widest border-b-2 text-center transition ${
                      activeTab === tb.value 
                        ? "border-black text-black" 
                        : "border-transparent text-[#999999] hover:text-black"
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: ALL REGISTERED CLAIMS */}
              {activeTab === "profile" && (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-[#F5F5F3] pb-1.5">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                      HISTORY OF SERVICE REQUESTS ({selectedUser.requests?.length || 0})
                    </h5>
                  </div>

                  {selectedUser.requests && selectedUser.requests.length > 0 ? (
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 divide-y divide-[#E5E5E3]">
                      {selectedUser.requests.map((req: any) => (
                        <div key={req.id} className="py-3 flex items-center justify-between hover:bg-[#FAF9F6] transition px-1">
                          <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-black text-xs uppercase leading-none">#{req.id}</span>
                              <span className="text-[10px] font-bold text-[#999999] bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded leading-none uppercase">
                                {req.category}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-800 font-semibold leading-relaxed truncate mt-1.5">
                              {req.description}
                            </p>
                            <span className="block text-[10px] text-[#999999] mt-0.5 font-mono">
                              Claim logged on {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 pl-4">
                            <StatusBadge value={req.status} />
                            <Link
                              to={`/admin/requests/${req.id}`}
                              className="h-8 w-8 rounded-full border border-[#E5E5E3] hover:border-black flex items-center justify-center transition hover:bg-neutral-50 shrink-0 bg-white"
                              title="Drill down into Request checklist details"
                            >
                              <ArrowRight className="w-4 h-4 text-neutral-700" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#E5E5E3] rounded-lg p-10 text-center text-xs text-[#999999] whitespace-pre-line leading-relaxed">
                      {"No active or completed repairs associated with this student's account currently."}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHRONOLOGICAL ACTIVITY AUDIT STREAM */}
              {activeTab === "activity" && (() => {
                const rawActivities = selectedUser.activities || [];
                
                // Get unique action types for this user to populate the select filter dynamic dropdown
                const uniqueActionTypes = Array.from(
                  new Set(rawActivities.map((act: any) => act.action).filter(Boolean))
                ) as string[];

                // Filter matching user input
                const filteredActs = rawActivities.filter((act: any) => {
                  const q = activitySearchQuery.toLowerCase();
                  const matchesSearch = 
                    (act.action || "").toLowerCase().includes(q) ||
                    (act.details || "").toLowerCase().includes(q) ||
                    (act.requestId || "").toLowerCase().includes(q);
                  
                  const matchesType = activityActionFilter === "ALL" || act.action === activityActionFilter;
                  return matchesSearch && matchesType;
                });

                const getActionColor = (action: string) => {
                  const act = (action || "").toLowerCase();
                  if (act.includes("create") || act.includes("submitted") || act.includes("intake")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (act.includes("status") || act.includes("workflow") || act.includes("progress")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
                  if (act.includes("update") || act.includes("profile") || act.includes("edit")) return "bg-purple-50 text-purple-700 border-purple-200";
                  if (act.includes("send") || act.includes("alert") || act.includes("broadcast") || act.includes("push") || act.includes("notif")) return "bg-amber-50 text-amber-700 border-amber-200";
                  if (act.includes("cancel") || act.includes("suspend") || act.includes("error") || act.includes("fail")) return "bg-rose-50 text-rose-700 border-rose-200";
                  if (act.includes("login") || act.includes("auth") || act.includes("sign")) return "bg-teal-50 text-teal-700 border-teal-200";
                  return "bg-neutral-50 text-neutral-700 border-neutral-200";
                };

                return (
                  <div className="space-y-4 text-left">
                    {/* Header */}
                    <div className="border-b border-[#F5F5F3] pb-1.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                          CHRONOLOGICAL DIGITAL FOOTPRINT RECORD
                        </h5>
                        <p className="text-[10px] text-neutral-500 font-medium">Detailed timestamped ledger of service requests and administrative updates.</p>
                      </div>
                      <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 border border-neutral-200 rounded px-2 py-0.5 leading-none font-bold uppercase select-none">
                        Audit Compliant
                      </span>
                    </div>

                    {/* Filter controls row */}
                    {rawActivities.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#FAF9F6] p-3 border-y border-[#E5E5E3]">
                        <div className="md:col-span-6 relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                            <Search className="h-3.5 w-3.5 text-[#999999]" />
                          </span>
                          <input
                            type="text"
                            placeholder="Filter activities by keyword..."
                            value={activitySearchQuery}
                            onChange={(e) => setActivitySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 h-8 bg-white border border-[#E5E5E3] rounded-md text-[11px] placeholder-[#999999] focus:outline-none focus:border-black transition font-medium"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <select
                            value={activityActionFilter}
                            onChange={(e) => setActivityActionFilter(e.target.value)}
                            className="w-full px-2 h-8 bg-white border border-[#E5E5E3] rounded-md text-[11px] focus:outline-none focus:border-black font-semibold"
                          >
                            <option value="ALL">All Event Types ({rawActivities.length})</option>
                            {uniqueActionTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setActivitySearchQuery("");
                              setActivityActionFilter("ALL");
                            }}
                            className="w-full md:w-auto h-8 px-3 border border-[#E5E5E3] hover:border-black bg-white rounded-md text-[10px] font-bold uppercase tracking-wider text-neutral-600 hover:text-black transition cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Activity Ledger Table block */}
                    {filteredActs.length > 0 ? (
                      <div className="overflow-x-auto border-b border-[#E5E5E3]">
                        <div className="max-h-[360px] overflow-y-auto">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#FAF9F6] z-10 select-none">
                              <tr className="border-b border-[#E5E5E3]">
                                <th className="p-3 text-[9px] font-extrabold uppercase tracking-widest text-[#555555] w-1/4">Timestamp / Age</th>
                                <th className="p-3 text-[9px] font-extrabold uppercase tracking-widest text-[#555555] w-1/5">Action Type</th>
                                <th className="p-3 text-[9px] font-extrabold uppercase tracking-widest text-[#555555] w-2/5">Ledger Details</th>
                                <th className="p-3 text-[9px] font-extrabold uppercase tracking-widest text-[#555555] w-1/6">Scope / Job</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {filteredActs.map((act: any) => {
                                const parsedDate = new Date(act.createdAt);
                                const hasValidDate = !isNaN(parsedDate.getTime());
                                return (
                                  <tr key={act.id} className="hover:bg-neutral-50/45 transition">
                                    {/* Column 1: Timestamp */}
                                    <td className="p-3 align-top whitespace-nowrap">
                                      {hasValidDate ? (
                                        <div className="space-y-0.5">
                                          <p className="text-[11px] font-bold text-black font-mono tracking-tight">
                                            {format(parsedDate, "MMM dd, yyyy HH:mm")}
                                          </p>
                                          <p className="text-[9px] text-[#999999] font-mono leading-none">
                                            {formatDistanceToNow(parsedDate, { addSuffix: true })}
                                          </p>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-neutral-400 font-mono">Invalid Date</span>
                                      )}
                                    </td>

                                    {/* Column 2: Action Badge */}
                                    <td className="p-3 align-top">
                                      <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider border font-mono ${getActionColor(act.action)}`}>
                                        {act.action || "Log entry"}
                                      </div>
                                    </td>

                                    {/* Column 3: Ledger Details Msg */}
                                    <td className="p-3 align-top">
                                      <p className="text-xs text-neutral-800 font-semibold leading-relaxed break-words max-w-sm">
                                        {act.details || "No transaction text was submitted for this audit stamp."}
                                      </p>
                                    </td>

                                    {/* Column 4: Associated Request Code */}
                                    <td className="p-3 align-top whitespace-nowrap">
                                      {act.requestId ? (
                                        <Link
                                          to={`/admin/requests/${act.requestId}`}
                                          className="inline-flex items-center gap-1 text-[9px] font-mono font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition"
                                          title={`Inspect repair workflow sheet #${act.requestId}`}
                                        >
                                          <span>#{act.requestId}</span>
                                          <ArrowRight className="w-2.5 h-2.5 shrink-0" />
                                        </Link>
                                      ) : (
                                        <div className="inline-flex items-center gap-1 text-[8px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded uppercase leading-none select-none">
                                          Account Level
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {/* Summary of table */}
                        <div className="p-3.5 bg-[#FAF9F6] border-t border-[#E5E5E3] flex justify-between items-center text-[10px] text-neutral-500 font-medium">
                          <span>
                            Showing <strong>{filteredActs.length}</strong> of <strong>{rawActivities.length}</strong> records
                          </span>
                          {(activitySearchQuery || activityActionFilter !== "ALL") && (
                            <button
                              type="button"
                              onClick={() => {
                                setActivitySearchQuery("");
                                setActivityActionFilter("ALL");
                              }}
                              className="text-black hover:underline font-bold inline-flex items-center gap-1"
                            >
                              Clear filters
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#E5E5E3] rounded-lg p-10 text-center text-xs text-[#999999] bg-[#FAF9F6]">
                        {rawActivities.length > 0 ? (
                          <>
                            <p className="font-bold text-black mb-1">No matches found for your active criteria</p>
                            <p className="text-[11px]">Try adjusting your search box or dropdown filter to see more user events.</p>
                          </>
                        ) : (
                          <p>No registered action stamps. All operations on this student are currently offline.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 3: COMMAND & ON-BEHALF CREATOR HUB */}
              {activeTab === "behalf" && (
                <div className="space-y-6">
                  
                  {/* HUB DIVIDER 1: ADMINISTRATIVE DIRECT ALERT */}
                  <div className="space-y-4.5 py-4 border-t border-[#E5E5E3]">
                    <div className="flex justify-between items-center border-b border-[#E5E5E3] pb-1.5">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4 text-[#111111] shrink-0" />
                        <span>SEND IN-APP BROADCAST / NOTIFICATION CHECKLIST</span>
                      </h5>
                      <span className="bg-[#F1F2E9] text-[#111111] border border-[#E5E5E3] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded font-mono select-none">
                        Immediate push
                      </span>
                    </div>

                    <form onSubmit={handleSendAlert} className="space-y-3.5 text-left">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase text-[#777777]">Notification Title</label>
                        <input
                          type="text"
                          value={alertTitle}
                          onChange={(e) => setAlertTitle(e.target.value)}
                          placeholder="e.g. Broken charger dropoff confirmation"
                          className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase text-[#777777]">Details Message Body</label>
                        <textarea
                          rows={2}
                          value={alertMessage}
                          onChange={(e) => setAlertMessage(e.target.value)}
                          placeholder="Provide the explanation or action checklist that triggers onto the student dashboard..."
                          className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={sendAlertMutation.isPending}
                          className="h-8 px-4 bg-[#111111] hover:bg-neutral-800 text-white font-bold text-[9px] uppercase tracking-wider rounded transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>{sendAlertMutation.isPending ? "Broadcasting..." : "Broadcast Alert"}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* HUB DIVIDER 2: LOG REPAIR CLAIM ON BEHALF OF CUSTOMER */}
                  <div className="space-y-4.5 py-4 border-t border-[#E5E5E3]">
                    <div className="flex justify-between items-center border-b border-[#E5E5E3] pb-1.5">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-black flex items-center gap-1">
                        <Wrench className="w-4 h-4 text-black shrink-0" />
                        <span>DISPATCH CLAIM JOB ON BEHALF (DESK INTAKE)</span>
                      </h5>
                      <span className="bg-stone-100 text-stone-600 border border-stone-200 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded font-mono select-none">
                        Direct Registration
                      </span>
                    </div>

                    <form onSubmit={handleCreateOnBehalf} className="space-y-3.5 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold uppercase text-[#777777]">Repair Category</label>
                          <select
                            value={behalfCategory}
                            onChange={(e) => setBehalfCategory(e.target.value)}
                            className="w-full text-xs p-2.5 bg-[#FAF9F6] border border-[#E5E5E3] rounded-lg focus:outline-none focus:border-black font-semibold"
                          >
                            <option value="phone">Smart-phone Hardware</option>
                            <option value="laptop">Laptop / Notebook IT</option>
                            <option value="clothing">Campus Uniform / Clothing</option>
                            <option value="shoe">Footwear & Sneakers</option>
                            <option value="accessories">Electronic Charger / Back-Pack</option>
                            <option value="other">General Other Category</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold uppercase text-[#777777]">Claim Urgency Priority</label>
                          <select
                            value={behalfPriority}
                            onChange={(e) => setBehalfPriority(e.target.value)}
                            className="w-full text-xs p-2.5 bg-[#FAF9F6] border border-[#E5E5E3] rounded-lg focus:outline-none focus:border-black font-semibold"
                          >
                            <option value="normal">Normal Pace Review</option>
                            <option value="high">High Care Priority</option>
                            <option value="urgent">Urgent Over-night Repair</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase text-[#777777]">Problem Description / Fault Specs <span className="text-red-500">*</span></label>
                        <textarea
                          rows={2.5}
                          value={behalfDescription}
                          onChange={(e) => setBehalfDescription(e.target.value)}
                          placeholder="e.g. MacBook Pro has loose USB-C port pin, needs soldering and circuit test..."
                          className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded-lg focus:outline-none focus:border-black font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold uppercase text-[#777777]">Private Operator/Drop-Off Desk Notes</label>
                        <input
                          type="text"
                          value={behalfNotes}
                          onChange={(e) => setBehalfNotes(e.target.value)}
                          placeholder="Locker 4C code placeholder notes. Will reside as additional specifications details..."
                          className="w-full text-xs p-2 border border-[#E5E5E3] bg-white rounded-lg focus:outline-none focus:border-black font-medium"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={createRequestMutation.isPending}
                          className="h-9 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{createRequestMutation.isPending ? "Logging claim..." : "Log Claim On Behalf"}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="p-16 text-center flex flex-col justify-center items-center h-[540px]">
              <User className="w-14 h-14 text-[#E5E5E3] select-none" />
              <h3 className="text-sm font-extrabold uppercase text-[#111111] tracking-wider mt-4">Auditing Console Idle</h3>
              <p className="text-xs text-[#999999] max-w-[280px] mt-1 pr-1.5 leading-relaxed font-semibold">
                Click any registered student on the left directory index to load and audit their profile, history stream, actions command, and logged repair checklists.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
