import React, { useState } from "react";
import { Candidate, JobOpening } from "../types";
import { AdminATSSection } from "./AdminATSSection";
import { CandidateDashboardTable } from "./CandidateDashboardTable";
import { AdminVacancyManagement } from "./AdminVacancyManagement";
import { AdminEECompliance } from "./AdminEECompliance";
import { DesignTokensShowcase } from "./DesignTokensShowcase";
import { PostJobModal } from "./PostJobModal";
import { AdminDashboard, EmailNotificationLog } from "./AdminDashboard";
import { Modal } from "./design-system/Modal";
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Palette, 
  ExternalLink, 
  PlusCircle, 
  Search, 
  Sliders, 
  Bell, 
  User, 
  CheckCircle2, 
  ChevronDown, 
  LogOut,
  Building2,
  Lock,
  ArrowRight,
  Zap,
  Globe,
  LayoutDashboard,
  Mail,
  Check,
  AlertCircle,
  FileText,
  Send,
  X
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";

interface AdminPortalProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  onRefreshData: () => Promise<void>;
  onUpdateCandidateStage: (candId: string, newStage: Candidate["stage"]) => Promise<void>;
  onCreateJob: (newJobData: any) => Promise<void>;
  onSwitchToPublic: () => void;
}

export type AdminTab = "dashboard" | "ats" | "candidates" | "vacancies" | "compliance" | "design_system";

export const AdminPortal: React.FC<AdminPortalProps> = ({
  jobs,
  candidates,
  onRefreshData,
  onUpdateCandidateStage,
  onCreateJob,
  onSwitchToPublic,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // Automated Email Notification Settings & Dispatch Logs
  const [autoEmailEnabled, setAutoEmailEnabled] = useState<boolean>(true);
  const [showEmailAuditModal, setShowEmailAuditModal] = useState<boolean>(false);
  const [activeEmailToast, setActiveEmailToast] = useState<{
    candidateName: string;
    email: string;
    stage: "shortlisted" | "rejected";
    jobTitle: string;
    timestamp: string;
    suppressed?: boolean;
  } | null>(null);

  // Initial audit log of email dispatches
  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>([
    {
      id: "email-seed-1",
      candidateId: "cand-1",
      candidateName: "Dr. Elizabeth Chen",
      candidateEmail: "e.chen@stanford.edu",
      jobId: "job-1",
      jobTitle: "Director: Strategic Partnerships and External Capacity Development",
      referenceNumber: "HSRC-EXEC-2026-08",
      stage: "shortlisted",
      subject: "HSRC Recruitment: Notice of Shortlisting - Director: Strategic Partnerships (Ref: HSRC-EXEC-2026-08)",
      body: "Dear Dr. Elizabeth Chen,\n\nWe are pleased to inform you that your application has been shortlisted by the Selection Committee at the Human Sciences Research Council (HSRC). Our Talent Acquisition team will be in touch shortly regarding the scheduling of your panel interview.",
      sentAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: "sent",
    },
    {
      id: "email-seed-2",
      candidateId: "cand-seed-2",
      candidateName: "Dr. Sibusiso Zulu",
      candidateEmail: "s.zulu@wits.ac.za",
      jobId: "job-3",
      jobTitle: "Stakeholder and Partnership Officer",
      referenceNumber: "HSRC-ADM-2026-44",
      stage: "rejected",
      subject: "HSRC Recruitment: Application Outcome - Stakeholder and Partnership Officer (Ref: HSRC-ADM-2026-44)",
      body: "Dear Dr. Sibusiso Zulu,\n\nThank you for your interest in the Stakeholder and Partnership Officer position at the Human Sciences Research Council. Following evaluation against mandatory criteria, your application was not progressed on this occasion.",
      sentAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: "sent",
    },
  ]);

  // Stage update handler with automated email dispatch
  const handleUpdateCandidateStageWithNotification = async (
    candId: string,
    newStage: Candidate["stage"]
  ) => {
    const cand = candidates.find((c) => c.id === candId);
    const job = jobs.find((j) => j.id === cand?.jobId);
    const jobTitle = job?.title || "Academic Vacancy";
    const refNo = job?.referenceNumber || "HSRC-VAC";

    await onUpdateCandidateStage(candId, newStage);

    if (newStage === "shortlisted" || newStage === "rejected") {
      if (autoEmailEnabled && cand) {
        const isShortlisted = newStage === "shortlisted";
        const subject = isShortlisted
          ? `HSRC Recruitment: Notice of Shortlisting - ${jobTitle} (Ref: ${refNo})`
          : `HSRC Recruitment: Application Outcome - ${jobTitle} (Ref: ${refNo})`;

        const body = isShortlisted
          ? `Dear ${cand.name},\n\nWe are pleased to inform you that your application for the position of ${jobTitle} (${refNo}) has been shortlisted by the Selection Committee at the Human Sciences Research Council (HSRC).\n\nOur Talent Acquisition team will be in touch shortly regarding the scheduling of your panel interview and seminar presentation.\n\nKind regards,\nDr. Nomvula Radebe\nChief Talent Acquisition Officer\nHuman Sciences Research Council (HSRC)`
          : `Dear ${cand.name},\n\nThank you for your application for the position of ${jobTitle} (${refNo}) at the Human Sciences Research Council (HSRC) and for the time invested in submitting your academic credentials.\n\nFollowing comprehensive evaluation by the Selection Committee against the mandatory qualification benchmarks, we regret to advise that your application has not been progressed on this occasion.\n\nWe appreciate your interest in the HSRC and wish you continued success in your academic research endeavours.\n\nKind regards,\nHSRC Selection Committee Directorate`;

        const newLog: EmailNotificationLog = {
          id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          candidateId: cand.id,
          candidateName: cand.name,
          candidateEmail: cand.email,
          jobId: cand.jobId,
          jobTitle,
          referenceNumber: refNo,
          stage: newStage,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: "sent",
        };

        setEmailLogs((prev) => [newLog, ...prev]);
        setActiveEmailToast({
          candidateName: cand.name,
          email: cand.email,
          stage: newStage,
          jobTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suppressed: false,
        });
      } else if (cand) {
        setActiveEmailToast({
          candidateName: cand.name,
          email: cand.email,
          stage: newStage,
          jobTitle,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suppressed: true,
        });
      }
    }
  };
  
  // Committee role simulation
  const [adminRole, setAdminRole] = useState<string>("Chief Talent Acquisition Officer");
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Pre-filter candidate table or ATS for a specific job
  const [filterJobId, setFilterJobId] = useState<string | undefined>(undefined);

  const handleNavigateToATSForJob = (jobId: string) => {
    setFilterJobId(jobId);
    setActiveTab("ats");
  };

  const handleNavigateToCandidatesForJob = (jobId: string) => {
    setFilterJobId(jobId);
    setActiveTab("candidates");
  };

  const roles = [
    { title: "Chief Talent Acquisition Officer", user: "Dr. Nomvula Radebe (HR Lead)" },
    { title: "Selection Committee Chair", user: "Prof. Kevin Naidoo (DCES Chair)" },
    { title: "Executive Research Director", user: "Dr. Zanele Sithole (HSC Director)" },
    { title: "Employment Equity Representative", user: "Adv. Sipho Khumalo (EE Observer)" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#1A1A1A] font-sans selection:bg-[#00A8B5]/20 selection:text-[#003366]">
      {/* 1. Administrative Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#002244] text-white border-b border-[#00172e] shadow-md">
        {/* Council HR Directorate Identifier */}
        <div className="bg-[#001a33] text-slate-300 py-1.5 px-4 sm:px-6 lg:px-8 text-xs border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Backend Admin Workspace • Council HR Directorate
              </span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Gemini 3.8 ATS Screening Engine Active
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onSwitchToPublic}
                className="text-xs text-[#00A8B5] hover:text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="View how job seekers see the portal"
              >
                <Globe className="w-3.5 h-3.5 text-[#00A8B5]" />
                <span>Switch to Public Careers Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Admin Controls Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding with Admin Shield */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-white flex items-center justify-center p-1.5 shadow-sm">
                  <div className="w-full h-full bg-[#003366] rounded-[4px] flex flex-col items-center justify-center text-white font-bold text-[10px] leading-tight">
                    <span className="text-[#00A8B5] font-black text-xs">HSRC</span>
                    <span className="text-[7px] tracking-tighter text-amber-400">ADMIN</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold text-white tracking-tight">
                      Selection Committee & ATS Console
                    </h1>
                    <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Internal
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">Talent Acquisition & Academic Peer Review Pipeline</p>
                </div>
              </div>

              {/* Admin Navigation Tabs */}
              <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-white/10">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "dashboard"
                      ? "bg-white/20 text-white ring-1 ring-[#00A8B5]/50 shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#00A8B5]" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("ats")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "ats"
                      ? "bg-white/20 text-white ring-1 ring-[#00A8B5]/50 shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />
                  <span>ATS Screening</span>
                  <span className="text-[9px] font-bold px-1 rounded bg-[#00A8B5] text-slate-950 uppercase">
                    AI
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("candidates")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "candidates"
                      ? "bg-white/20 text-white shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-slate-300" />
                  <span>Candidate Pipeline</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-white/20 text-slate-200">
                    {candidates.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("vacancies")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "vacancies"
                      ? "bg-white/20 text-white shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                  <span>Vacancies</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-white/20 text-slate-200">
                    {jobs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("compliance")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "compliance"
                      ? "bg-white/20 text-white shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EE Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab("design_system")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "design_system"
                      ? "bg-white/20 text-white shadow-xs font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tokens</span>
                </button>
              </nav>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2.5">
              {/* Automated Email Quick Badge & Modal Opener */}
              <button
                onClick={() => setShowEmailAuditModal(true)}
                title="Automated email notifications on candidate status change - Click to manage or view audit logs"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    autoEmailEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
                  }`}
                />
                <Mail className="w-3.5 h-3.5 text-[#00A8B5]" />
                <span className="hidden xl:inline">Auto-Email:</span>
                <span className={`font-bold ${autoEmailEnabled ? "text-emerald-300" : "text-slate-400"}`}>
                  {autoEmailEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#00A8B5] hover:bg-[#008080] text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post Vacancy</span>
              </button>

              {/* Committee Role Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors cursor-pointer border border-white/10"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00A8B5] text-slate-950 font-bold flex items-center justify-center text-[10px]">
                    HR
                  </div>
                  <span className="hidden md:inline max-w-[140px] truncate">{adminRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-300" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Switch Committee Identity
                    </div>
                    {roles.map((r, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAdminRole(r.title);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex flex-col cursor-pointer ${
                          adminRole === r.title ? "bg-slate-50 font-bold text-[#003366]" : "text-slate-700"
                        }`}
                      >
                        <span>{r.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{r.user}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onSwitchToPublic();
                        }}
                        className="text-xs text-red-600 hover:text-red-800 py-1 flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Exit to Public View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex border-t border-white/10 bg-[#00172e] px-4 py-2 overflow-x-auto gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "dashboard" ? "bg-[#00A8B5] text-slate-950 font-bold" : "text-slate-300 bg-white/5"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("ats")}
            className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "ats" ? "bg-[#00A8B5] text-slate-950 font-bold" : "text-slate-300 bg-white/5"
            }`}
          >
            ATS Auto-Screen
          </button>
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "candidates" ? "bg-white/20 text-white font-bold" : "text-slate-300 bg-white/5"
            }`}
          >
            Pipeline ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab("vacancies")}
            className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "vacancies" ? "bg-white/20 text-white font-bold" : "text-slate-300 bg-white/5"
            }`}
          >
            Vacancies ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-3 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "compliance" ? "bg-white/20 text-white font-bold" : "text-slate-300 bg-white/5"
            }`}
          >
            EE Audit
          </button>
          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="px-3 py-1 rounded-md whitespace-nowrap bg-emerald-600 text-white font-bold ml-auto cursor-pointer"
          >
            + Post Job
          </button>
        </div>
      </header>

      {/* 2. Admin Workspace Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Toast for Automated Email Status Changes */}
        {activeEmailToast && (
          <div
            className={`mb-6 p-4 rounded-[8px] border shadow-sm flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300 ${
              activeEmailToast.suppressed
                ? "bg-slate-100 border-slate-300 text-slate-800"
                : "bg-emerald-50 border-emerald-300 text-emerald-950"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  activeEmailToast.suppressed ? "bg-slate-500" : "bg-emerald-600"
                }`}
              >
                {activeEmailToast.suppressed ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {activeEmailToast.suppressed
                    ? `Applicant Status Updated to '${activeEmailToast.stage}' (Email Suppressed)`
                    : `Automated Email Dispatched: ${activeEmailToast.candidateName}`}
                </p>
                <p className="opacity-90 mt-0.5">
                  {activeEmailToast.suppressed
                    ? `Automated email notifications are currently disabled in Admin Portal. No email was sent to ${activeEmailToast.email}.`
                    : `Official HSRC ${activeEmailToast.stage} decision notice sent to ${activeEmailToast.email} for '${activeEmailToast.jobTitle}' at ${activeEmailToast.timestamp}.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!activeEmailToast.suppressed && (
                <button
                  onClick={() => setShowEmailAuditModal(true)}
                  className="font-bold text-[#003366] hover:underline px-2 py-1 text-xs cursor-pointer"
                >
                  View Audit Log
                </button>
              )}
              <button
                onClick={() => setActiveEmailToast(null)}
                className="text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 1. Admin Dashboard View */}
        {activeTab === "dashboard" && (
          <AdminDashboard
            jobs={jobs}
            candidates={candidates}
            autoEmailEnabled={autoEmailEnabled}
            onToggleAutoEmail={setAutoEmailEnabled}
            emailLogs={emailLogs}
            onNavigateToTab={(tab) => {
              if (tab === "ats") setActiveTab("ats");
              else if (tab === "candidates") setActiveTab("candidates");
              else if (tab === "vacancies") setActiveTab("vacancies");
              else if (tab === "compliance") setActiveTab("compliance");
            }}
            onOpenPostJobModal={() => setIsPostJobModalOpen(true)}
            onViewEmailLogModal={() => setShowEmailAuditModal(true)}
          />
        )}

        {/* 2. ATS Screening Section */}
        {activeTab === "ats" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>ATS Automated Screening & Auto-Shortlisting</span>
                  <Badge variant="shortlisted" size="sm">
                    Automated Engine
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate candidates against mandatory qualifications, academic citations (H-index/ORCID), and probability of alignment using Gemini 3.8-Flash.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("candidates")}
                  className="cursor-pointer text-xs"
                >
                  <Users className="w-3.5 h-3.5 mr-1 text-[#008080]" />
                  View All Dossiers
                </Button>
              </div>
            </div>

            <AdminATSSection
              candidates={candidates}
              jobs={jobs}
              onRefreshCandidates={onRefreshData}
              onUpdateCandidateStage={handleUpdateCandidateStageWithNotification}
            />
          </div>
        )}

        {/* 3. Candidate Pipeline & Dossiers */}
        {activeTab === "candidates" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Candidate Dossiers & Pipeline Table</span>
                  <Badge variant="primary" size="sm">
                    {candidates.length} Applications
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage stage transitions (Applied, Committee Review, Seminar, Offer) and inspect candidate CV details.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("ats")}
                className="cursor-pointer text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Run ATS Screening
              </Button>
            </div>

            <CandidateDashboardTable
              candidates={candidates}
              jobs={jobs}
              userRole="recruiter"
              autoEmailEnabled={autoEmailEnabled}
              onToggleAutoEmail={setAutoEmailEnabled}
              onUpdateCandidateStage={handleUpdateCandidateStageWithNotification}
              onNavigateToApply={() => onSwitchToPublic()}
              onNavigateToATS={() => setActiveTab("ats")}
            />
          </div>
        )}

        {/* Vacancies Management */}
        {activeTab === "vacancies" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Vacancy Management & Requisitions</span>
                  <Badge variant="secondary" size="sm">
                    {jobs.length} Positions
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Oversee active academic positions, closing deadlines, and candidate application counts across divisions.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPostJobModalOpen(true)}
                className="cursor-pointer text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" />
                Create New Vacancy
              </Button>
            </div>

            <AdminVacancyManagement
              jobs={jobs}
              candidates={candidates}
              onOpenPostJob={() => setIsPostJobModalOpen(true)}
              onNavigateToATSForJob={handleNavigateToATSForJob}
              onNavigateToCandidatesForJob={handleNavigateToCandidatesForJob}
            />
          </div>
        )}

        {/* EE Compliance */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Employment Equity & Statutory Transformation</span>
                  <Badge variant="shortlisted" size="sm">
                    EEA S20 Compliance
                  </Badge>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  South African Department of Employment and Labour equity targets, gender parity tracking, and transformation metrics.
                </p>
              </div>
            </div>

            <AdminEECompliance
              candidates={candidates}
              jobs={jobs}
            />
          </div>
        )}

        {/* Design System & Specs */}
        {activeTab === "design_system" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Design Tokens & UI Component Specifications
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Primary palette (#003366), Secondary teal (#00A8B5), 8px border-radius, WCAG AA standards, and token hierarchies.
                </p>
              </div>
            </div>

            <DesignTokensShowcase />
          </div>
        )}
      </main>

      {/* 3. Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#003366]">HSRC Internal HR Information System</span>
            <span>• Authorized Personnel & Selection Committee Members Only</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSwitchToPublic}
              className="text-[#00A8B5] hover:text-[#008080] font-semibold cursor-pointer"
            >
              Back to Public Applicant Careers Portal
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Post Job Modal */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobCreated={onCreateJob}
      />

      {/* 5. Email Notification Audit & Settings Modal */}
      {showEmailAuditModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowEmailAuditModal(false)}
          title="Automated Applicant Email Notifications Console"
          subtitle="Council Selection Committee • Statutory Applicant Communication Engine"
          maxWidth="3xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Audit Records:</span>
                <span>{emailLogs.length} Dispatches Recorded</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEmailAuditModal(false)}
              >
                Close Console
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Master Toggle Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 border ${
                    autoEmailEnabled
                      ? "bg-teal-50 text-[#008080] border-teal-200"
                      : "bg-slate-150 text-slate-400 border-slate-300"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Automated Email Dispatch
                    </span>
                    <Badge variant={autoEmailEnabled ? "shortlisted" : "pending"} size="sm">
                      {autoEmailEnabled ? "Active & Dispatched" : "Muted"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When enabled, applicant dossiers transitioned to <strong>Shortlisted</strong> or <strong>Not Progressed</strong> automatically trigger council notification emails.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-700">
                  {autoEmailEnabled ? "Mailing Active" : "Mailing Disabled"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoEmailEnabled}
                  onClick={() => setAutoEmailEnabled(!autoEmailEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                    autoEmailEnabled ? "bg-[#008080]" : "bg-slate-300"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoEmailEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Templates Preview */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Council Email Templates
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shortlisted Template */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-[8px] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      Template 1: Shortlisted Candidate
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Automatic
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Subject: <em>HSRC Recruitment: Notice of Shortlisting - [Position Title] (Ref: [Ref #])</em>
                  </p>
                  <div className="bg-white p-3 rounded-[6px] border border-emerald-100 text-slate-700 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                    Dear [Candidate Name],{"\n\n"}
                    We are pleased to inform you that your application for the position of [Position Title] has been shortlisted by the Selection Committee at the Human Sciences Research Council (HSRC).{"\n\n"}
                    Our Talent Acquisition team will be in touch shortly regarding the scheduling of your panel interview and research presentation.{"\n\n"}
                    Kind regards,{"\n"}
                    HSRC Talent Acquisition Directorate
                  </div>
                </div>

                {/* Rejection Template */}
                <div className="bg-rose-50/50 border border-rose-200 rounded-[8px] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                      Template 2: Not Progressed
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                      Automatic
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Subject: <em>HSRC Recruitment: Application Outcome - [Position Title] (Ref: [Ref #])</em>
                  </p>
                  <div className="bg-white p-3 rounded-[6px] border border-rose-100 text-slate-700 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                    Dear [Candidate Name],{"\n\n"}
                    Thank you for your interest in the [Position Title] position at the Human Sciences Research Council (HSRC). Following evaluation against mandatory criteria, your application was not progressed on this occasion.{"\n\n"}
                    We appreciate your interest and wish you every success in your future endeavours.{"\n\n"}
                    Kind regards,{"\n"}
                    HSRC Selection Committee
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recent Dispatch Activity Log
                </h4>
                <span className="text-[11px] text-slate-400">
                  Showing last {Math.min(emailLogs.length, 10)} notifications
                </span>
              </div>

              <div className="border border-slate-200 rounded-[8px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Recipient & Email</th>
                        <th className="py-2.5 px-3">Position</th>
                        <th className="py-2.5 px-3">Outcome</th>
                        <th className="py-2.5 px-3">Dispatched At</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emailLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            No notifications dispatched in this session yet.
                          </td>
                        </tr>
                      ) : (
                        emailLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 block">{log.candidateName}</span>
                              <span className="text-slate-500 font-mono text-[10px]">{log.candidateEmail}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 max-w-[180px] truncate" title={log.jobTitle}>
                              {log.jobTitle}
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge
                                variant={log.stage === "shortlisted" ? "shortlisted" : "rejected"}
                                size="sm"
                              >
                                {log.stage === "shortlisted" ? "Shortlisted" : "Not Progressed"}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                              {new Date(log.sentAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                                <Check className="w-3 h-3" /> Sent
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
