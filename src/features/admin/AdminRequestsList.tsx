/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../../hooks/queries";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Inbox, HelpCircle } from "lucide-react";
import Skeleton from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/Badge";

type FilterTab = "all" | "pending" | "quote_sent" | "in_progress" | "ready" | "urgent";

export default function AdminRequestsList() {
  const navigate = useNavigate();
  const { data: requests, isLoading, error } = useRequests();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sorting state
  const [sortAscending, setSortAscending] = useState(false); // Default: oldest first or newest first

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Helper: compute days open
  const getDaysOpen = (createdAtStr: string) => {
    const created = new Date(createdAtStr);
    const diffTime = Math.abs(Date.now() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Removed hardcoded getStatusDisplay to adhere to standardized StatusBadge

  // Priority map matching mockup exactly
  const renderPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return <span className="ml-2 text-xs uppercase font-semibold text-[#111111] shrink-0 select-none tracking-wider">URGENT</span>;
      case "high":
        return <span className="ml-2 text-xs uppercase font-medium text-[#555555] shrink-0 select-none tracking-wider">HIGH</span>;
      case "medium":
      case "normal":
        return <span className="ml-2 text-xs uppercase font-normal text-[#999999] shrink-0 select-none tracking-wider">NORMAL</span>;
      case "low":
        return <span className="ml-2 text-xs uppercase font-normal text-[#999999] shrink-0 select-none tracking-wider">LOW</span>;
      default:
        return null;
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    let result = requests ? [...requests] : [];

    // Filter by searching
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.studentName.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term) ||
          r.id.toLowerCase().includes(term)
      );
    }

    // Filter by category dropdown
    if (categoryFilter !== "all") {
      result = result.filter((r) => r.category === categoryFilter);
    }

    // Filter by Tab Selector matching screenshot 2 logic
    switch (activeTab) {
      case "pending":
        result = result.filter((r) => r.status === "submitted" || r.status === "under_review");
        break;
      case "quote_sent":
        result = result.filter((r) => r.status === "quote_sent");
        break;
      case "in_progress":
        result = result.filter((r) => r.status === "confirmed" || r.status === "with_provider");
        break;
      case "ready":
        result = result.filter((r) => r.status === "ready_for_collection");
        break;
      case "urgent":
        result = result.filter((r) => r.priority === "urgent" || r.priority === "high");
        break;
      case "all":
      default:
        break;
    }

    return result;
  }, [requests, searchTerm, activeTab, categoryFilter]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const result = [...filteredRequests];
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
    return result;
  }, [filteredRequests, sortAscending]);

  // Paginate requests
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRequests, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / itemsPerPage));

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* HEADER ROW WITH INTEGRATED FUNNEL ACTION */}
      <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E3]">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]" id="page-title">All Requests</h1>
        <div className="flex items-center gap-3">
          {/* Dynamic sort order toggle */}
          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="p-1.5 border border-[#E5E5E3] rounded-lg hover:bg-white text-[#555555] hover:text-[#111111] transition flex items-center justify-center cursor-pointer"
            title={sortAscending ? "Showing oldest first" : "Showing newest first"}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER TABS ROW - SHADED PILLS EXACTLY AS IMAGE 2 */}
      <div className="flex items-center gap-2 flex-wrap" id="tab-filters-row">
        
        {/* All Status */}
        <button
          onClick={() => handleTabChange("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "all"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#555555] hover:bg-neutral-50"
          }`}
        >
          All Status
        </button>

        {/* Pending Review */}
        <button
          onClick={() => handleTabChange("pending")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "pending"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#555555] hover:bg-neutral-50"
          }`}
        >
          Pending Review
        </button>

        {/* Quote Sent */}
        <button
          onClick={() => handleTabChange("quote_sent")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "quote_sent"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#555555] hover:bg-neutral-50"
          }`}
        >
          Quote Sent
        </button>

        {/* In Progress */}
        <button
          onClick={() => handleTabChange("in_progress")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "in_progress"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#555555] hover:bg-neutral-50"
          }`}
        >
          In Progress
        </button>

        {/* Ready */}
        <button
          onClick={() => handleTabChange("ready")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "ready"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#555555] hover:bg-neutral-50"
          }`}
        >
          Ready
        </button>

        {/* Urgent Tab */}
        <button
          onClick={() => handleTabChange("urgent")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold select-none transition cursor-pointer ${
            activeTab === "urgent"
              ? "bg-[#111111] text-white"
              : "bg-white border border-[#E5E5E3] text-[#111111] hover:bg-neutral-50"
          }`}
        >
          Urgent
        </button>
      </div>

      {/* SEARCH AND CATEGORY SELECTION */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by student, ID, issue details..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-9 pr-3 bg-white border border-[#E5E5E3] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#111111] shadow-xs"
          />
          <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 px-3 bg-white border border-[#E5E5E3] rounded-lg text-xs font-semibold text-[#555555] focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-xs"
        >
          <option value="all">All Specialties</option>
          <option value="phone">Phones</option>
          <option value="laptop">Laptops</option>
          <option value="clothing">Clothing</option>
          <option value="shoe">Shoes</option>
          <option value="accessories">Accessories</option>
          <option value="other">Other Specialties</option>
        </select>
      </div>

      {/* REQUESTS LIST - FLAT DIRECT-ON-PAGE DESIGN PER GUIDELINES */}
      <div className="border-t border-b border-[#E5E5E3]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((v) => (
              <div key={v} className="flex justify-between items-center py-2.5">
                <div className="space-y-2">
                  <Skeleton width="140px" height="14px" />
                  <Skeleton width="220px" height="12px" />
                </div>
                <Skeleton width="70px" height="20px" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500 font-semibold text-xs uppercase tracking-wider">
            Failed to retrieve requests catalog
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="p-16 text-center space-y-2.5">
            <Inbox className="w-9 h-9 text-[#999999] mx-auto opacity-70" />
            <p className="text-xs font-bold uppercase tracking-wider text-black">No jobs match requirements</p>
            <p className="text-xs text-[#999999]">Try clearing search keywords or choosing different filter categories.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E5E3]">
            {paginatedRequests.map((req) => {
              const daysOpen = getDaysOpen(req.createdAt);

              return (
                <div
                  key={req.id}
                  onClick={() => navigate(`/admin/requests/${req.id}`)}
                  className="p-5 flex justify-between items-center hover:bg-[#F7F7F5] active:bg-[#F5F5F3] select-none transition cursor-pointer"
                >
                  
                  {/* Left Column Stack */}
                  <div className="space-y-1.5 flex-1 pr-6 min-w-0">
                    <div className="flex items-center flex-wrap">
                      <span className="text-sm font-bold text-[#111111]">{req.studentName}</span>
                      {renderPriorityBadge(req.priority)}
                    </div>
                    
                    <div className="text-xs text-[#555555] truncate max-w-xl">
                      <span className="font-semibold text-black capitalize">{req.category}</span>
                      {req.description && ` • ${req.description}`}
                    </div>
                  </div>

                  {/* Right Column Stack */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    {/* Status badge pill */}
                    <StatusBadge value={req.status} className="scale-90 origin-right" />
                    
                    {/* Days open counter */}
                    <span className={`text-[12px] tracking-tight ${daysOpen >= 3 ? "text-[#555555] font-semibold" : "text-[#999999] font-normal"}`}>
                      {daysOpen === 0 ? "0 days open" : `${daysOpen} day${daysOpen === 1 ? "" : "s"} open`}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAGINATION PANEL - FLAT NO BOX BACKGROUND */}
      {!isLoading && !error && sortedRequests.length > 0 && (
        <div className="py-4 flex items-center justify-between border-b border-[#E5E5E3]">
          <span className="text-xs text-[#555555]">
            Showing <span className="font-semibold">{Math.min(sortedRequests.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{" "}
            <span className="font-semibold">{Math.min(currentPage * itemsPerPage, sortedRequests.length)}</span> of{" "}
            <span className="font-mono font-semibold">{sortedRequests.length}</span> results
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 px-2 border border-[#E5E5E3] rounded bg-white text-xs text-[#555555] active:bg-neutral-100 disabled:opacity-40 select-none cursor-pointer disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Before
            </button>
            
            <span className="text-xs font-bold text-black select-none">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-2 border border-[#E5E5E3] rounded bg-white text-xs text-[#555555] active:bg-neutral-100 disabled:opacity-40 select-none cursor-pointer disabled:cursor-not-allowed transition flex items-center gap-1 font-semibold"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
