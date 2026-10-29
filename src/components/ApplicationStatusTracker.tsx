import React, { useState, useMemo } from "react";
import { Candidate, JobOpening } from "../types";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  ExternalLink, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
  Award
} from "lucide-react";
import { Badge, BadgeVariant } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Card } from "./design-system/Card";
import { Input } from "./design-system/Input";

interface ApplicationStatusTrackerProps {
  candidates: Candidate[];
  jobs: JobOpening[];
  onNavigateToApply?: () => void;
  onNavigateToVacancies?: () => void;
}

export const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  candidates,
  jobs,
  onNavigateToApply,
  onNavigateToVacancies,
}) => {
  const [query, setQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Map job ID to JobOpening
  const jobMap = useMemo(() => {
    const map = new Map<string, JobOpening>();
    jobs.forEach((j) => map.set(j.id, j));
    return map;
  }, [jobs]);

  const handleSearch = (searchTerm?: string) => {
    const term = (searchTerm !== undefined ? searchTerm : query).trim().toLowerCase();
    setHasSearched(true);
    if (!term) {
      setSelectedCandidate(null);
      return;
    }

    const found = candidates.find(
      (c) =>
        c.email.toLowerCase() === term ||
        c.id.toLowerCase() === term ||
        c.name.toLowerCase().includes(term)
    );
    setSelectedCandidate(found || null);
  };

  const associatedJob = selectedCandidate ? jobMap.get(selectedCandidate.jobId) : null;

  // Lifecycle stage steps
  const stageSteps = [
    {
      key: "applied",
      title: "1. Dossier Ingestion",
      desc: "Application, CV, and academic credentials received by HR.",
    },
    {
      key: "screening",
      title: "2. ATS Screening",
      desc: "Algorithmic compliance check against minimum requirements & criteria.",
    },
    {
      key: "committee_review",
      title: "3. Selection Committee Review",
      desc: "Dossier evaluated by Division Research Directors and Specialists.",
    },
    {
      key: "seminar",
      title: "4. Academic Seminar / Interview",
      desc: "Invited presentation and formal panel assessment.",
    },
    {
      key: "offer",
      title: "5. Recommendation & Appointment",
      desc: "Final appointment offer subject to Council clearance.",
    },
  ];

  const getStageIndex = (stage: Candidate["stage"]) => {
    switch (stage) {
      case "applied":
        return 0;
      case "shortlisted":
        return 2; // progressed past screening to committee
      case "committee_review":
        return 2;
      case "seminar":
        return 3;
      case "offer":
        return 4;
      case "rejected":
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = selectedCandidate ? getStageIndex(selectedCandidate.stage) : 0;

  const getStageBadge = (stage: Candidate["stage"]): { variant: BadgeVariant; label: string } => {
    switch (stage) {
      case "applied":
        return { variant: "applied", label: "Application Received" };
      case "shortlisted":
        return { variant: "shortlisted", label: "Shortlisted for Review" };
      case "committee_review":
        return { variant: "in_review", label: "Under Committee Evaluation" };
      case "seminar":
        return { variant: "pending", label: "Seminar / Interview Scheduled" };
      case "offer":
        return { variant: "shortlisted", label: "Appointment Offer Extended" };
      case "rejected":
        return { variant: "rejected", label: "Application Concluded" };
      default:
        return { variant: "info", label: stage };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Tracker Hero Card */}
      <div className="bg-gradient-to-br from-[#003366] via-[#0A4B83] to-[#002244] text-white rounded-xl p-8 shadow-md border border-[#002244]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#00A8B5]/10 pointer-events-none blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#00A8B5] border border-white/15">
            <ShieldCheck className="w-4 h-4 text-[#00A8B5]" />
            Candidate Self-Service Status Tracker
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Track Your HSRC Application Progress
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Enter the registered email address or reference ID used during your job application submission to track your dossier through council screening, committee shortlisting, and interview scheduling.
          </p>

          {/* Search Bar */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your email (e.g. dr.n.khumalo@uct.ac.za) or candidate ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-lg text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A8B5] shadow-inner"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-[#00A8B5] hover:bg-[#008080] text-slate-950 font-bold text-sm rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-950" />
              Track Dossier
            </button>
          </div>

          {/* Quick Demo Pre-fill Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-medium text-white/70">Sample candidate lookups:</span>
            {candidates.slice(0, 3).map((cand) => (
              <button
                key={cand.id}
                onClick={() => {
                  setQuery(cand.email);
                  handleSearch(cand.email);
                }}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-mono transition-colors border border-white/10 cursor-pointer"
              >
                {cand.name.split(" ")[0]} ({cand.email})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      {selectedCandidate ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Status Dossier Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    REF: {selectedCandidate.id}
                  </span>
                  <Badge variant={getStageBadge(selectedCandidate.stage).variant} size="md">
                    {getStageBadge(selectedCandidate.stage).label}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-slate-900 pt-1">
                  {selectedCandidate.name}
                </h3>
                <p className="text-sm font-medium text-[#003366] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#00A8B5]" />
                  {associatedJob?.title || "Academic Research Opening"}
                  <span className="text-slate-400 font-normal">
                    • Ref: {associatedJob?.referenceNumber || "HSRC-VAC-2026"}
                  </span>
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-slate-200 space-y-1 text-xs text-slate-500">
                <p className="flex items-center sm:justify-end gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Submitted: <span className="font-semibold text-slate-700">{selectedCandidate.dateApplied}</span>
                </p>
                <p className="flex items-center sm:justify-end gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Cycle: <span className="font-semibold text-slate-700">Q1 2026 Intake</span>
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-2 space-y-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Recruitment Timeline & Milestone Progress
              </h4>
              
              {selectedCandidate.stage === "rejected" ? (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-red-900">Application Concluded</h5>
                    <p className="text-xs text-red-700 mt-1">
                      Following competitive assessment by the selection committee, this application has not progressed to the interview stage. We thank you for your commitment to South African social science research and encourage you to apply for future opportunities.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-slate-200 z-0">
                    <div 
                      className="h-full bg-[#00A8B5] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, (currentStepIdx / (stageSteps.length - 1)) * 100))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {stageSteps.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const isPending = idx > currentStepIdx;

                      return (
                        <div 
                          key={step.key} 
                          className={`p-3.5 rounded-lg border text-left transition-all ${
                            isCurrent
                              ? "bg-sky-50/70 border-[#00A8B5] ring-2 ring-[#00A8B5]/20 shadow-xs"
                              : isCompleted
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white border-slate-100 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#003366] text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-xs font-bold ${isCurrent ? "text-[#003366]" : "text-slate-700"}`}>
                              {step.title.split(". ")[1]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {step.desc}
                          </p>
                          {isCurrent && (
                            <span className="mt-2 inline-block text-[10px] font-bold text-[#008080] uppercase tracking-wide">
                              ● Current Stage
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Submitted Details & Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#003366]" />
                  Applicant Contact & Identifiers
                </h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-xs border border-slate-200/60">
                  <div className="flex justify-between py-1 border-b border-slate-200/40">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-semibold text-slate-800">{selectedCandidate.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/40">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-semibold text-slate-800">{selectedCandidate.phone || "On File"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/40">
                    <span className="text-slate-500">ORCID Researcher ID:</span>
                    <span className="font-mono text-[#003366] font-semibold">
                      {selectedCandidate.orcid || "Pending link"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Publications on Record:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedCandidate.publications?.length || 0} indexed articles
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#003366]" />
                  Next Steps in Selection
                </h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2.5 text-xs border border-slate-200/60">
                  <p className="text-slate-600 leading-relaxed">
                    The HSRC Selection Committee conducts formal deliberations across academic credentials, publication track records, and strategic alignment with South Africa's developmental agendas.
                  </p>
                  <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-semibold text-[#003366]">What should you expect?</p>
                    <p>
                      Shortlisted applicants will receive an invitation to an academic seminar presentation and panel interview 7 days prior to committee sitting.
                    </p>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Enquiries: <a href="mailto:recruitment@hsrc.ac.za" className="text-[#00A8B5] font-semibold underline">recruitment@hsrc.ac.za</a></span>
                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono">POPIA Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-900">No Application Record Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't locate an application matching <span className="font-mono font-bold text-slate-800">"{query}"</span>. Please check for typos or ensure you are using the primary email submitted on your CV.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {onNavigateToApply && (
              <Button variant="primary" size="sm" onClick={onNavigateToApply}>
                Submit an Application
              </Button>
            )}
            {onNavigateToVacancies && (
              <Button variant="secondary" size="sm" onClick={onNavigateToVacancies}>
                Browse Vacancies
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Explanatory Cards When Idle */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#003366]/10 text-[#003366] flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Instant Status Updates</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track your exact placement across 5 recruitment phases from initial submission to final appointment offer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#00A8B5]/10 text-[#008080] flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Transparent Milestones</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Understand timeline commitments, required committee documents, and seminar preparation guidelines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Council Integrity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              All applications are assessed in compliance with South African Employment Equity and statutory research ethics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
