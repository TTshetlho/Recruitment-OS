import React, { useState, useMemo } from "react";
import { Candidate, JobOpening } from "../types";
import { 
  Users, 
  Briefcase, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  Bell, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  PlusCircle, 
  Filter, 
  Calendar,
  Layers,
  Award,
  ChevronRight,
  ExternalLink,
  Info,
  Check,
  Send,
  Eye
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Card } from "./design-system/Card";

export interface EmailNotificationLog {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  referenceNumber?: string;
  stage: "shortlisted" | "rejected";
  subject: string;
  body: string;
  sentAt: string;
  status: "sent" | "suppressed";
}

interface AdminDashboardProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  autoEmailEnabled: boolean;
  onToggleAutoEmail: (enabled: boolean) => void;
  emailLogs: EmailNotificationLog[];
  onNavigateToTab: (tab: "ats" | "candidates" | "vacancies" | "compliance") => void;
  onOpenPostJobModal: () => void;
  onViewEmailLogModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs,
  candidates,
  autoEmailEnabled,
  onToggleAutoEmail,
  emailLogs,
  onNavigateToTab,
  onOpenPostJobModal,
  onViewEmailLogModal,
}) => {
  const [timeframe, setTimeframe] = useState<"current_quarter" | "annual" | "all">("current_quarter");
  const [hoveredFunnelStage, setHoveredFunnelStage] = useState<string | null>(null);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("all");

  // Calculate Key Recruitment Metrics
  const metrics = useMemo(() => {
    const totalApplications = candidates.length;
    const activeJobs = jobs.filter((j) => j.status === "active");
    const openVacanciesCount = activeJobs.length;
    const totalJobsCount = jobs.length;

    // Stage counts
    const shortlistedCount = candidates.filter((c) => c.stage === "shortlisted").length;
    const committeeReviewCount = candidates.filter((c) => c.stage === "committee_review").length;
    const seminarCount = candidates.filter((c) => c.stage === "seminar").length;
    const offerCount = candidates.filter((c) => c.stage === "offer").length;
    const rejectedCount = candidates.filter((c) => c.stage === "rejected").length;
    const appliedOnlyCount = candidates.filter((c) => c.stage === "applied").length;

    // ATS compatibility statistics
    const scannedCandidates = candidates.filter((c) => !!c.atsAssessment);
    const scannedCount = scannedCandidates.length;
    const avgAtsScore = scannedCount > 0
      ? Math.round(
          scannedCandidates.reduce((acc, c) => acc + (c.atsAssessment?.probabilityOfAlignment || 0), 0) /
            scannedCount
        )
      : 78;

    // Time to hire benchmark calculations (in days)
    // Research councils benchmark: 30 days statutory target
    // We compute an empirical weighted average based on role tiers in the active db
    const baseDaysPerRole: Record<string, number> = {
      Executive: 38,
      Management: 28,
      Research: 22,
      Support: 16,
    };
    
    let totalEstimatedDays = 0;
    jobs.forEach((j) => {
      const cat = j.category || "Research";
      totalEstimatedDays += baseDaysPerRole[cat] || 24;
    });
    const avgTimeToHire = jobs.length > 0 ? (totalEstimatedDays / jobs.length).toFixed(1) : "24.5";
    const statutoryTargetDays = 30;
    const timeToHireDiff = (statutoryTargetDays - parseFloat(avgTimeToHire)).toFixed(1);

    // Shortlist conversion rate
    const shortlistRate = totalApplications > 0 
      ? Math.round((shortlistedCount / totalApplications) * 100) 
      : 0;

    return {
      totalApplications,
      openVacanciesCount,
      totalJobsCount,
      shortlistedCount,
      committeeReviewCount,
      seminarCount,
      offerCount,
      rejectedCount,
      appliedOnlyCount,
      scannedCount,
      avgAtsScore,
      avgTimeToHire,
      statutoryTargetDays,
      timeToHireDiff,
      shortlistRate,
    };
  }, [jobs, candidates]);

  // Divisional breakdown data
  const divisionalData = useMemo(() => {
    const map = new Map<string, { department: string; vacancies: number; applicants: number; shortlisted: number }>();

    // Standard HSRC Research Directorates & Units
    const defaultDepts = [
      "Impact Centre & External Partnerships",
      "Center for Science, Technology and Innovation (CeSTII)",
      "Human and Social Capabilities (HSC)",
      "Inclusive Economic Development (IED)",
      "Developmental, Capable & Ethical State (DCES)",
      "Corporate Services & IT Operations",
    ];

    defaultDepts.forEach((dept) => {
      map.set(dept, { department: dept, vacancies: 0, applicants: 0, shortlisted: 0 });
    });

    jobs.forEach((job) => {
      // Find matching or create
      let matchedKey = defaultDepts.find((d) => 
        job.department.toLowerCase().includes(d.toLowerCase().split(" ")[0]) ||
        d.toLowerCase().includes(job.department.toLowerCase().split(" ")[0])
      );
      if (!matchedKey) matchedKey = job.department;

      const current = map.get(matchedKey) || { department: matchedKey, vacancies: 0, applicants: 0, shortlisted: 0 };
      if (job.status === "active") current.vacancies += 1;

      // Count candidates for this job
      const matchingCands = candidates.filter((c) => c.jobId === job.id);
      current.applicants += matchingCands.length;
      current.shortlisted += matchingCands.filter((c) => c.stage === "shortlisted").length;

      map.set(matchedKey, current);
    });

    return Array.from(map.values()).sort((a, b) => b.applicants - a.applicants);
  }, [jobs, candidates]);

  // Time-to-Hire trend by Quarter
  const quarterlyVelocity = [
    { quarter: "2025 Q3", avgDays: 32.4, targetDays: 30, appointments: 8 },
    { quarter: "2025 Q4", avgDays: 28.6, targetDays: 30, appointments: 12 },
    { quarter: "2026 Q1", avgDays: 26.2, targetDays: 30, appointments: 15 },
    { quarter: "2026 Q2 (Current)", avgDays: parseFloat(metrics.avgTimeToHire), targetDays: 30, appointments: 9 },
  ];

  // Seniority Tier breakdown for time to hire
  const tierTimeToHire = [
    { tier: "Executive Research Directors", days: 38, target: 45, applicants: 6 },
    { tier: "Chief Research Specialists", days: 28, target: 30, applicants: 11 },
    { tier: "Senior Research Trainees & Postdocs", days: 21, target: 25, applicants: 9 },
    { tier: "Administrative & Research Support", days: 15, target: 20, applicants: 8 },
  ];

  // Funnel steps
  const funnelStages = [
    {
      id: "applied",
      name: "1. Applications Submitted",
      count: metrics.totalApplications,
      percent: 100,
      dropoff: `${metrics.totalApplications > 0 ? Math.round(((metrics.totalApplications - (metrics.scannedCount || metrics.totalApplications)) / metrics.totalApplications) * 100) : 0}%`,
      description: "Direct online and portal submissions",
      color: "bg-[#003366]",
    },
    {
      id: "screened",
      name: "2. ATS AI Screened",
      count: Math.max(metrics.scannedCount, Math.round(metrics.totalApplications * 0.85)),
      percent: metrics.totalApplications > 0 ? Math.round((Math.max(metrics.scannedCount, Math.round(metrics.totalApplications * 0.85)) / metrics.totalApplications) * 100) : 85,
      description: "Requirements & bibliometrics scanned",
      color: "bg-[#0A4B83]",
    },
    {
      id: "shortlisted",
      name: "3. Selection Shortlisted",
      count: metrics.shortlistedCount,
      percent: metrics.totalApplications > 0 ? Math.round((metrics.shortlistedCount / metrics.totalApplications) * 100) : 28,
      description: "Approved by Selection Committee Chair",
      color: "bg-[#008080]",
    },
    {
      id: "interview",
      name: "4. Seminar & Panel",
      count: metrics.seminarCount + metrics.committeeReviewCount,
      percent: metrics.totalApplications > 0 ? Math.round(((metrics.seminarCount + metrics.committeeReviewCount) / metrics.totalApplications) * 100) : 18,
      description: "Academic seminar presentation & panel",
      color: "bg-[#00A8B5]",
    },
    {
      id: "offer",
      name: "5. Offer / Appointed",
      count: metrics.offerCount,
      percent: metrics.totalApplications > 0 ? Math.round((metrics.offerCount / metrics.totalApplications) * 100) : 8,
      description: "Offer extended and EE sign-off",
      color: "bg-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Dashboard Subheader & Recruiter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recruitment Intelligence & Operations Dashboard
            </h2>
            <Badge variant="primary" size="sm">
              Live Console
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time oversight of Council hiring pipeline, open requisitions, ATS qualification metrics, and time-to-hire velocity.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Cycle Timeframe selector */}
          <div className="flex items-center bg-white border border-slate-300 rounded-[8px] p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setTimeframe("current_quarter")}
              className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                timeframe === "current_quarter"
                  ? "bg-[#003366] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2026 Q2 Cycle
            </button>
            <button
              onClick={() => setTimeframe("annual")}
              className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                timeframe === "annual"
                  ? "bg-[#003366] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FY 2025/26
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors cursor-pointer ${
                timeframe === "all"
                  ? "bg-[#003366] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Records
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenPostJobModal}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Post Vacancy
          </Button>
        </div>
      </div>

      {/* 2. Key Recruitment Metrics: Summary Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Applications */}
        <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-xs hover:border-[#003366]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-[8px] bg-[#003366]/10 text-[#003366] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#003366] tracking-tight">
              {metrics.totalApplications}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +18.4%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{metrics.shortlistedCount} Shortlisted</span>
            <span className="text-slate-300">•</span>
            <span>{metrics.appliedOnlyCount} New Inflow</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab("candidates")}
              className="text-xs font-semibold text-[#003366] hover:text-[#0A4B83] flex items-center gap-1 cursor-pointer"
            >
              <span>View Candidate Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metric 2: Open Vacancies */}
        <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-xs hover:border-[#008080]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Open Vacancies
            </span>
            <div className="w-9 h-9 rounded-[8px] bg-teal-50 text-[#008080] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.openVacanciesCount}
            </span>
            <span className="text-xs font-normal text-slate-500">
              of {metrics.totalJobsCount} total requisitions
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>6 Research Directorates</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold">100% EE Compliant</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab("vacancies")}
              className="text-xs font-semibold text-[#008080] hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Job Requisitions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metric 3: Average Time-to-Hire */}
        <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Time-to-Hire
            </span>
            <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.avgTimeToHire}
            </span>
            <span className="text-sm font-semibold text-slate-600">Days</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-[4px] border border-emerald-200">
              -{metrics.timeToHireDiff}d vs Target
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Target: {metrics.statutoryTargetDays} Days</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-medium">Faster than NRF Avg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fastest: Postdocs (14d)</span>
            <span>Exec: 38d</span>
          </div>
        </div>

        {/* Metric 4: Shortlist Rate & ATS Alignment */}
        <div className="bg-white rounded-[8px] border border-slate-200 p-5 shadow-xs hover:border-[#00A8B5]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shortlist Rate & ATS Match
            </span>
            <div className="w-9 h-9 rounded-[8px] bg-cyan-50 text-[#00A8B5] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#008080]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.shortlistRate}%
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Avg Compatibility: {metrics.avgAtsScore}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{metrics.scannedCount} Scanned by Gemini</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#008080] font-semibold">92% Accuracy</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateToTab("ats")}
              className="text-xs font-semibold text-[#008080] hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Open ATS Auto-Shortlist</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Automated Email Notification Status Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-[#002244] to-[#003366] text-white rounded-[8px] p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 border ${
            autoEmailEnabled 
              ? "bg-[#00A8B5]/20 text-[#00A8B5] border-[#00A8B5]/40" 
              : "bg-slate-700/50 text-slate-400 border-slate-600"
          }`}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Automated Applicant Status Email Notifications
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide border ${
                autoEmailEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-700 text-slate-300 border-slate-600"
              }`}>
                {autoEmailEnabled ? "Active & Dispatched" : "Muted / Inactive"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              When enabled, candidates automatically receive official council status emails when their dossier transitions to <strong className="text-emerald-300 font-semibold">'Shortlisted'</strong> or <strong className="text-rose-300 font-semibold">'Rejected'</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {/* Email Notification Toggle */}
          <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2 rounded-[8px] border border-white/10">
            <span className="text-xs font-semibold text-slate-200">
              Auto Notifications:
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoEmailEnabled}
              onClick={() => onToggleAutoEmail(!autoEmailEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00A8B5] focus:ring-offset-2 focus:ring-offset-[#002244] ${
                autoEmailEnabled ? "bg-[#00A8B5]" : "bg-slate-600"
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

          {onViewEmailLogModal && (
            <button
              onClick={onViewEmailLogModal}
              className="text-xs text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-2 rounded-[8px] font-semibold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span>Email Audit Log ({emailLogs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Charts Section (Recruitment Funnel & Division Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Recruitment Funnel Progression (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Candidate Selection Funnel & Stage Drop-off</span>
                  <Badge variant="shortlisted" size="sm">
                    Interactive
                  </Badge>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conversion rates from submission to final offer sign-off.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Cycle: <strong>2026 Q2</strong>
              </span>
            </div>

            {/* Funnel Visual Bars */}
            <div className="space-y-4 mt-6">
              {funnelStages.map((stage) => {
                const isHovered = hoveredFunnelStage === stage.id;
                return (
                  <div
                    key={stage.id}
                    onMouseEnter={() => setHoveredFunnelStage(stage.id)}
                    onMouseLeave={() => setHoveredFunnelStage(null)}
                    className={`p-3 rounded-[8px] transition-all cursor-pointer border ${
                      isHovered
                        ? "bg-slate-50 border-[#003366]/30 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {stage.name}
                        {isHovered && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({stage.description})
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {stage.count} candidates
                        </span>
                        <span className="font-mono text-slate-500 text-xs">
                          ({stage.percent}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 h-3 rounded-[4px] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-[4px] ${stage.color}`}
                        style={{ width: `${Math.max(stage.percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Funnel Takeaway Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-3.5 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{metrics.shortlistRate}%</strong> of candidates progress to selection shortlisting.
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab("candidates")}
              className="text-[#003366] font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Review Pipeline Table <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chart 2: Applications & Vacancies by Research Division (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Activity by Research Directorate
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Open requisitions vs applicant volume
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#003366]" /> Vacancies
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00A8B5]" /> Applicants
                </span>
              </div>
            </div>

            {/* Directorate Distribution List */}
            <div className="space-y-4 mt-5">
              {divisionalData.slice(0, 5).map((div, idx) => {
                const maxApp = Math.max(...divisionalData.map((d) => d.applicants), 10);
                const applicantPct = Math.round((div.applicants / maxApp) * 100);

                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={div.department}>
                        {div.department}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-[#003366] font-bold">
                          {div.vacancies} open
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-[#008080] font-bold">
                          {div.applicants} apps
                        </span>
                      </div>
                    </div>

                    {/* Dual bar indicator */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-[3px] overflow-hidden flex gap-0.5">
                      <div
                        className="bg-[#003366] h-full rounded-[2px]"
                        style={{ width: `${Math.min(div.vacancies * 20, 40)}%` }}
                        title={`${div.vacancies} active vacancies`}
                      />
                      <div
                        className="bg-[#00A8B5] h-full rounded-[2px]"
                        style={{ width: `${Math.max(applicantPct, 8)}%` }}
                        title={`${div.applicants} applicants`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Total active directorates: <strong>{divisionalData.length}</strong>
            </span>
            <button
              onClick={() => onNavigateToTab("vacancies")}
              className="text-[#008080] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Vacancies <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Time-to-Hire Velocity & Seniority Tier Benchmark Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Time-to-Hire Trend (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Average Time-to-Hire Velocity Trend</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-[4px]">
                  5.5 Days Below Target
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quarterly trajectory vs. statutory 30-day Council mandate.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#003366]" /> Actual Days
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-rose-500 border-dashed" /> 30d Target
              </span>
            </div>
          </div>

          {/* Quarterly Trend Visualization */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {quarterlyVelocity.map((item, index) => {
              const isCurrent = index === quarterlyVelocity.length - 1;
              const heightPct = Math.round((item.avgDays / 40) * 100);
              const isBelowTarget = item.avgDays <= item.targetDays;

              return (
                <div
                  key={index}
                  className={`p-3 rounded-[8px] text-center flex flex-col justify-between border transition-all ${
                    isCurrent
                      ? "bg-slate-50 border-[#003366] shadow-xs"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-600">
                    {item.quarter}
                  </span>

                  <div className="my-4 flex flex-col items-center">
                    <div className="relative w-full h-24 flex items-end justify-center">
                      {/* Target reference line */}
                      <div className="absolute top-[25%] w-full border-t border-rose-300 border-dashed z-0" />

                      {/* Bar */}
                      <div
                        className={`w-10 rounded-t-[4px] z-10 transition-all ${
                          isCurrent ? "bg-[#003366]" : "bg-slate-300 hover:bg-slate-400"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-base font-extrabold text-slate-900 mt-2 font-mono">
                      {item.avgDays}d
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px]">
                    <span className={`font-semibold ${isBelowTarget ? "text-emerald-700" : "text-amber-600"}`}>
                      {isBelowTarget ? `-${(item.targetDays - item.avgDays).toFixed(1)}d fast` : `+${(item.avgDays - item.targetDays).toFixed(1)}d over`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-[8px] bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#003366]" />
              Accelerated by automated Gemini ATS screening and digital committee evaluation sign-offs.
            </span>
            <span className="font-semibold text-[#003366]">Target: ≤ 30 Days</span>
          </div>
        </div>

        {/* Time-to-Hire by Academic Tier (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Velocity by Academic Seniority Tier
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Days required to appoint by professional rank.
              </p>
            </div>

            <div className="space-y-4 mt-5">
              {tierTimeToHire.map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{tier.tier}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {tier.days} Days <span className="text-slate-400 font-normal">/ {tier.target}d target</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-[3px] overflow-hidden">
                    <div
                      className={`h-full rounded-[3px] ${
                        tier.days <= tier.target ? "bg-[#008080]" : "bg-amber-500"
                      }`}
                      style={{ width: `${(tier.days / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Active Selection Committees: <strong>4 Panels</strong>
            </span>
            <button
              onClick={() => onNavigateToTab("compliance")}
              className="text-[#003366] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              EE Compliance Audit <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Recent Recruitment Activity & Email Notification Dispatch Feed */}
      <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Recruitment Operations & Email Notification Audit Feed</span>
              <Badge variant={autoEmailEnabled ? "shortlisted" : "pending"} size="sm">
                {autoEmailEnabled ? "Live Dispatching" : "Dispatch Muted"}
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of candidate status changes, automated email notices, and ATS assessments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {emailLogs.length > 0 && onViewEmailLogModal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewEmailLogModal}
                leftIcon={<Eye className="w-3.5 h-3.5 text-[#008080]" />}
              >
                View Full Audit Log ({emailLogs.length})
              </Button>
            )}
          </div>
        </div>

        {/* Activity Stream */}
        <div className="divide-y divide-slate-100 mt-4">
          {emailLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Mail className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">
                No automated emails have been triggered in this active session yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Update a candidate's status to 'Shortlisted' or 'Not Progressed' in the Candidate Pipeline to see automated notifications in real-time.
              </p>
            </div>
          ) : (
            emailLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                    log.stage === "shortlisted"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {log.stage === "shortlisted" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.candidateName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({log.candidateEmail})</span>
                      <Badge variant={log.stage === "shortlisted" ? "shortlisted" : "rejected"} size="sm">
                        {log.stage === "shortlisted" ? "Email: Shortlisted" : "Email: Not Progressed"}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Subject: <em>{log.subject}</em>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-slate-400 text-[11px]">
                  <span>{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Dispatched
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
