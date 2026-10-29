import React, { useState, useMemo } from "react";
import { JobOpening, Candidate } from "../types";
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Filter,
  Eye,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Badge, BadgeVariant } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Card } from "./design-system/Card";
import { Modal } from "./design-system/Modal";

interface AdminVacancyManagementProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  onOpenPostJob: () => void;
  onNavigateToATSForJob: (jobId: string) => void;
  onNavigateToCandidatesForJob: (jobId: string) => void;
}

export const AdminVacancyManagement: React.FC<AdminVacancyManagementProps> = ({
  jobs,
  candidates,
  onOpenPostJob,
  onNavigateToATSForJob,
  onNavigateToCandidatesForJob,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);

  // Group candidate statistics by Job ID
  const candidateStatsByJob = useMemo(() => {
    const stats = new Map<string, { total: number; shortlisted: number; unscanned: number }>();
    jobs.forEach((job) => {
      const jobCands = candidates.filter((c) => c.jobId === job.id);
      const shortlisted = jobCands.filter((c) => c.stage === "shortlisted" || c.stage === "seminar" || c.stage === "offer").length;
      const unscanned = jobCands.filter((c) => !c.atsAssessment).length;
      stats.set(job.id, {
        total: jobCands.length,
        shortlisted,
        unscanned,
      });
    });
    return stats;
  }, [jobs, candidates]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.grantCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  const getJobStatusBadge = (status: JobOpening["status"]): { variant: BadgeVariant; label: string } => {
    switch (status) {
      case "active":
        return { variant: "shortlisted", label: "Active / Accepting Dossiers" };
      case "filled":
        return { variant: "info", label: "Position Filled" };
      case "draft":
        return { variant: "pending", label: "Draft / Committee Review" };
      default:
        return { variant: "info", label: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by vacancy title, ref #, or grant code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses ({jobs.length})</option>
            <option value="active">Active Only</option>
            <option value="draft">Drafts Only</option>
            <option value="filled">Filled Only</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenPostJob}
          className="shadow-sm cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Post New Vacancy
        </Button>
      </div>

      {/* Vacancies Grid / List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No vacancies match your filter</h3>
            <p className="text-xs text-slate-500">Try adjusting your search terms or create a new job opening.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const stats = candidateStatsByJob.get(job.id) || { total: 0, shortlisted: 0, unscanned: 0 };
            const statusInfo = getJobStatusBadge(job.status);

            return (
              <div
                key={job.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-[#003366]/40 transition-all p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Vacancy Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold bg-[#003366]/10 text-[#003366] px-2 py-0.5 rounded">
                      {job.referenceNumber || job.id}
                    </span>
                    <Badge variant={statusInfo.variant} size="sm">
                      {statusInfo.label}
                    </Badge>
                    {job.grantCode && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Grant: {job.grantCode}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-[#003366] transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.townCity || "Pretoria"}, {job.province || "Gauteng"} ({job.workplaceType || "On-site"})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Posted: {job.datePosted}
                    </span>
                    {job.dateClosing && (
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Closes: {job.dateClosing}
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate Stats Metrics */}
                <div className="flex items-center gap-6 bg-slate-50 p-3.5 rounded-lg border border-slate-100 shrink-0 w-full md:w-auto justify-around">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-900">{stats.total}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Applicants
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-700">{stats.shortlisted}</div>
                    <div className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">
                      Shortlisted
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#008080]">{stats.unscanned}</div>
                    <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Unscanned
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="p-2 text-slate-500 hover:text-[#003366] hover:bg-slate-100 rounded-lg text-xs font-medium cursor-pointer"
                    title="View Job Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigateToCandidatesForJob(job.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#003366] bg-[#003366]/10 hover:bg-[#003366]/20 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Applicants ({stats.total})
                  </button>

                  <button
                    onClick={() => onNavigateToATSForJob(job.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0A4B83] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
                    ATS Scan
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {selectedJob.referenceNumber || selectedJob.id}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Division: {selectedJob.department}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Location: {selectedJob.townCity || "Pretoria"}, {selectedJob.province || "Gauteng"}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Job Overview & Mandate
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {selectedJob.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Mandatory Qualifications & Criteria
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Status: <span className="font-semibold text-slate-800">{selectedJob.status.toUpperCase()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const id = selectedJob.id;
                    setSelectedJob(null);
                    onNavigateToCandidatesForJob(id);
                  }}
                >
                  View Dossiers
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const id = selectedJob.id;
                    setSelectedJob(null);
                    onNavigateToATSForJob(id);
                  }}
                >
                  Open ATS Screen
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
