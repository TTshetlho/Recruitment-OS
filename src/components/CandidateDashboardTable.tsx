import React, { useState, useMemo } from "react";
import { Candidate, JobOpening } from "../types";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ArrowUpDown, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Sparkles, 
  BookOpen, 
  Award, 
  Mail, 
  Phone, 
  UserCheck, 
  ExternalLink,
  Download,
  AlertCircle
} from "lucide-react";
import { Badge, BadgeVariant } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Input } from "./design-system/Input";
import { Modal } from "./design-system/Modal";

interface CandidateDashboardTableProps {
  candidates: Candidate[];
  jobs: JobOpening[];
  userRole: "applicant" | "recruiter";
  onUpdateCandidateStage?: (candId: string, newStage: Candidate["stage"]) => Promise<void>;
  onNavigateToApply?: () => void;
}

export const CandidateDashboardTable: React.FC<CandidateDashboardTableProps> = ({
  candidates,
  jobs,
  userRole,
  onUpdateCandidateStage,
  onNavigateToApply,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "dateApplied" | "hIndex" | "stage">("dateApplied");
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected candidate for detail modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [updatingStage, setUpdatingStage] = useState(false);

  // Map job ID to title & reference number
  const jobMap = useMemo(() => {
    const map = new Map<string, JobOpening>();
    jobs.forEach((j) => map.set(j.id, j));
    return map;
  }, [jobs]);

  // Stage to Badge variant mapping
  const getStageBadgeVariant = (stage: string): { variant: BadgeVariant; label: string } => {
    switch (stage) {
      case "applied":
        return { variant: "applied", label: "Applied" };
      case "shortlisted":
        return { variant: "shortlisted", label: "Shortlisted" };
      case "committee_review":
      case "in_review":
        return { variant: "in_review", label: "In Committee Review" };
      case "seminar":
        return { variant: "pending", label: "Seminar / Interview" };
      case "offer":
        return { variant: "shortlisted", label: "Offer Extended" };
      case "rejected":
        return { variant: "rejected", label: "Not Progressed" };
      default:
        return { variant: "info", label: stage };
    }
  };

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const job = jobMap.get(cand.jobId);
      const matchesQuery =
        !q ||
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        (job && job.title.toLowerCase().includes(q)) ||
        (job && job.referenceNumber?.toLowerCase().includes(q)) ||
        (cand.orcid && cand.orcid.toLowerCase().includes(q));

      // Stage filter
      const matchesStage =
        selectedStageFilter === "all" ||
        cand.stage === selectedStageFilter;

      return matchesQuery && matchesStage;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "dateApplied") {
        comparison = (a.dateApplied || "").localeCompare(b.dateApplied || "");
      } else if (sortField === "hIndex") {
        comparison = (a.hIndex || 0) - (b.hIndex || 0);
      } else if (sortField === "stage") {
        comparison = a.stage.localeCompare(b.stage);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [candidates, searchQuery, selectedStageFilter, sortField, sortAsc, jobMap]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const handleSort = (field: "name" | "dateApplied" | "hIndex" | "stage") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleStageChange = async (newStage: Candidate["stage"]) => {
    if (!selectedCandidate || !onUpdateCandidateStage) return;
    setUpdatingStage(true);
    try {
      await onUpdateCandidateStage(selectedCandidate.id, newStage);
      setSelectedCandidate({ ...selectedCandidate, stage: newStage });
    } catch (err) {
      console.error("Error updating stage:", err);
    } finally {
      setUpdatingStage(false);
    }
  };

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: candidates.length,
      applied: 0,
      committee_review: 0,
      shortlisted: 0,
      seminar: 0,
      offer: 0,
      rejected: 0,
    };
    candidates.forEach((c) => {
      if (counts[c.stage] !== undefined) {
        counts[c.stage]++;
      }
    });
    return counts;
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input with standard Icon & Focus state */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search candidate, job, or ref #..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Quick Stage Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Records", count: stageCounts.all },
              { id: "applied", label: "Applied", count: stageCounts.applied },
              { id: "committee_review", label: "In Review", count: stageCounts.committee_review },
              { id: "shortlisted", label: "Shortlisted", count: stageCounts.shortlisted },
              { id: "seminar", label: "Seminar / Interview", count: stageCounts.seminar },
              { id: "offer", label: "Offer", count: stageCounts.offer },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStageFilter(st.id);
                  setCurrentPage(1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedStageFilter === st.id
                    ? "bg-[#003366] text-white border-[#003366] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedStageFilter === st.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Standardized Table Component */}
      <div className="bg-white rounded-[8px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate & Academic ID</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Applied Vacancy</th>
                <th
                  onClick={() => handleSort("dateApplied")}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date Applied</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("hIndex")}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Impact (h-Index / Pubs)</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("stage")}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Current Status</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800">No applications found</h4>
                      <p className="text-xs text-slate-500">
                        {searchQuery || selectedStageFilter !== "all"
                          ? "Try adjusting your search terms or clearing the stage filter."
                          : "No candidate applications have been recorded yet."}
                      </p>
                      {onNavigateToApply && (
                        <div className="pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={onNavigateToApply}
                          >
                            Submit New Application
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((cand) => {
                  const job = jobMap.get(cand.jobId);
                  const badgeInfo = getStageBadgeVariant(cand.stage);
                  const initials = cand.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={cand.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Candidate Avatar & Academic Identity */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[8px] bg-[#003366] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                              {cand.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{cand.email}</span>
                              {cand.orcid && (
                                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  ORCID: {cand.orcid}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Applied Vacancy */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {job ? job.title : "Research Position"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {job?.referenceNumber || "HSRC-GEN"} • {job?.department || "Council-wide"}
                        </p>
                      </td>

                      {/* Date Applied */}
                      <td className="py-4 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                        {cand.dateApplied || "2026/08/20"}
                      </td>

                      {/* Impact metrics */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#003366] bg-[#003366]/10 px-2 py-0.5 rounded-[6px] border border-[#003366]/20 font-mono">
                            h-Index: {cand.hIndex ?? (cand.cvParsedData?.hIndex || 0)}
                          </span>
                          <span className="text-slate-500 font-medium">
                            {cand.publications?.length || cand.cvParsedData?.publications?.length || 0} Pubs
                          </span>
                        </div>
                      </td>

                      {/* Status Pill Tag */}
                      <td className="py-4 px-4">
                        <Badge variant={badgeInfo.variant}>
                          {badgeInfo.label}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedCandidate(cand)}
                            leftIcon={<Eye className="w-3.5 h-3.5 text-[#008080]" />}
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Anchored Pagination and Summary Controls */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredCandidates.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredCandidates.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredCandidates.length}</span>{" "}
            applications
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <span className="px-3 py-1 font-semibold bg-white border border-slate-200 rounded-[8px] text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Candidate Detailed View & Evaluation Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCandidate(null)}
          title={`Candidate Dossier: ${selectedCandidate.name}`}
          subtitle={`Reference ID: ${selectedCandidate.id} • Registered under HSRC Recruitment Engine`}
          maxWidth="3xl"
          footer={
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Pipeline Stage:</span>
                {userRole === "recruiter" ? (
                  <select
                    value={selectedCandidate.stage}
                    disabled={updatingStage}
                    onChange={(e) => handleStageChange(e.target.value as Candidate["stage"])}
                    className="text-xs font-semibold px-3 py-1.5 rounded-[8px] border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                  >
                    <option value="applied">Applied</option>
                    <option value="committee_review">In Committee Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="seminar">Seminar / Interview</option>
                    <option value="offer">Offer Extended</option>
                    <option value="rejected">Not Progressed</option>
                  </select>
                ) : (
                  <Badge variant={getStageBadgeVariant(selectedCandidate.stage).variant}>
                    {getStageBadgeVariant(selectedCandidate.stage).label}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => {
                    alert(`Application profile for ${selectedCandidate.name} exported as official HSRC Dossier.`);
                  }}
                >
                  Export Dossier
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="bg-slate-50 rounded-[8px] p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-[#003366]">{selectedCandidate.name}</h4>
                <p className="text-xs text-slate-600 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedCandidate.email}
                  </span>
                  {selectedCandidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedCandidate.phone}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedCandidate.orcid && (
                  <div className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-[8px] border border-emerald-200">
                    ORCID: {selectedCandidate.orcid}
                  </div>
                )}
                <div className="text-xs bg-[#003366]/10 text-[#003366] font-bold px-3 py-1 rounded-[8px] border border-[#003366]/20 font-mono">
                  h-Index: {selectedCandidate.hIndex ?? (selectedCandidate.cvParsedData?.hIndex || 0)}
                </div>
              </div>
            </div>

            {/* Position Applied Information */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#008080]" />
                Target Vacancy Specification
              </h5>
              <div className="p-3.5 bg-white rounded-[8px] border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {jobMap.get(selectedCandidate.jobId)?.title || "Academic Opening"}
                </p>
                <p className="text-slate-500">
                  Department: {jobMap.get(selectedCandidate.jobId)?.department || "Human Sciences Research Council"}
                </p>
                <p className="text-slate-500">
                  Reference: {jobMap.get(selectedCandidate.jobId)?.referenceNumber || "HSRC-VAC"}
                </p>
              </div>
            </div>

            {/* Research Proposal & Academic Summary */}
            {selectedCandidate.researchProposal && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#008080]" />
                  Statement of Research Interest & Proposal
                </h5>
                <div className="p-4 bg-slate-50 rounded-[8px] border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-line">
                  {selectedCandidate.researchProposal}
                </div>
              </div>
            )}

            {/* Ingested Publications */}
            {((selectedCandidate.publications && selectedCandidate.publications.length > 0) ||
              (selectedCandidate.cvParsedData?.publications && selectedCandidate.cvParsedData.publications.length > 0)) && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#008080]" />
                  Verified Peer-Reviewed Publications
                </h5>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-[8px] bg-white overflow-hidden text-xs">
                  {(selectedCandidate.publications || selectedCandidate.cvParsedData?.publications || []).map(
                    (pub, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-50">
                        <p className="font-bold text-slate-900">{pub.title}</p>
                        <p className="text-slate-500 mt-0.5">
                          {pub.journal} ({pub.year}) • {pub.citations} citations
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Raw CV Ingestion preview if available */}
            {selectedCandidate.cvTextRaw && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00A8B5]" />
                  Ingested CV Text Content
                </h5>
                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-[8px] max-h-36 overflow-y-auto leading-relaxed">
                  {selectedCandidate.cvTextRaw}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
