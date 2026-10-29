import React, { useState } from "react";
import { JobOpening, Candidate } from "../types";
import { JobVacanciesExplorer } from "./JobVacanciesExplorer";
import { JobApplicationStepForm } from "./JobApplicationStepForm";
import { ApplicationStatusTracker } from "./ApplicationStatusTracker";
import { 
  Briefcase, 
  Search, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Users, 
  MapPin, 
  Calendar,
  Sparkles,
  Info,
  ChevronRight
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";

interface ApplicantPortalProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  onApplySubmit: (candData: any) => Promise<boolean>;
  onSwitchToAdmin: () => void;
  preselectedJobId?: string;
  onClearPreselectedJob?: () => void;
}

export type ApplicantSubTab = "vacancies" | "apply" | "track" | "about";

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({
  jobs,
  candidates,
  onApplySubmit,
  onSwitchToAdmin,
  preselectedJobId,
  onClearPreselectedJob,
}) => {
  const [activeTab, setActiveTab] = useState<ApplicantSubTab>(preselectedJobId ? "apply" : "vacancies");
  const [currentPreselectedJobId, setCurrentPreselectedJobId] = useState<string | undefined>(preselectedJobId);

  const handleApplyForJob = (job: JobOpening) => {
    setCurrentPreselectedJobId(job.id);
    setActiveTab("apply");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-[#00A8B5]/20 selection:text-[#003366]">
      {/* 1. Public Institutional Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        {/* Top Official Strip */}
        <div className="bg-[#003366] text-white py-1.5 px-4 sm:px-6 lg:px-8 text-xs font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A8B5] animate-pulse" />
              <span className="font-semibold text-slate-100">Official Careers Portal</span>
              <span className="hidden sm:inline text-slate-300">• Human Sciences Research Council (HSRC)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-[11px] text-slate-300">
                Republic of South Africa Statutory Research Body
              </span>
              <button
                onClick={onSwitchToAdmin}
                className="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#00A8B5] hover:text-white font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-white/20"
                title="Access Staff ATS Screening & Committee Pipeline"
              >
                <Lock className="w-3 h-3 text-[#00A8B5]" />
                <span>Staff & Committee Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Public Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* HSRC Logo & Title */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveTab("vacancies")}
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#003366] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[4px] flex flex-col items-center justify-center text-white font-bold text-[10px] leading-tight">
                  <span className="text-[#00A8B5] font-black text-xs">HSRC</span>
                  <span className="text-[7px] tracking-tighter text-slate-200">CAREERS</span>
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-[#003366] tracking-tight group-hover:text-[#0A4B83] transition-colors flex items-center gap-2">
                  HSRC Research Vacancies
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Applicant Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-500">Social Science that makes a difference</p>
              </div>
            </div>

            {/* Public Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab("vacancies")}
                className={`px-3 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "vacancies"
                    ? "bg-[#003366] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#003366] hover:bg-slate-100"
                }`}
              >
                <Briefcase className={`w-4 h-4 ${activeTab === "vacancies" ? "text-[#00A8B5]" : "text-slate-400"}`} />
                <span>Explore Vacancies</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "vacancies" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {jobs.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentPreselectedJobId(undefined);
                  setActiveTab("apply");
                }}
                className={`px-3 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "apply"
                    ? "bg-[#003366] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#003366] hover:bg-slate-100"
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${activeTab === "apply" ? "text-[#00A8B5]" : "text-slate-400"}`} />
                <span>Apply Online</span>
              </button>

              <button
                onClick={() => setActiveTab("track")}
                className={`px-3 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "track"
                    ? "bg-[#003366] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#003366] hover:bg-slate-100"
                }`}
              >
                <Search className={`w-4 h-4 ${activeTab === "track" ? "text-[#00A8B5]" : "text-slate-400"}`} />
                <span>Track Application</span>
              </button>

              <button
                onClick={() => setActiveTab("about")}
                className={`px-3 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "about"
                    ? "bg-[#003366] text-white shadow-xs"
                    : "text-slate-600 hover:text-[#003366] hover:bg-slate-100"
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeTab === "about" ? "text-[#00A8B5]" : "text-slate-400"}`} />
                <span>About HSRC Careers</span>
              </button>
            </nav>

            {/* Admin Switcher Callout */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToAdmin}
                className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[#003366] bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <Lock className="w-3.5 h-3.5 text-[#008080]" />
                <span>Recruiter / Admin Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex border-t border-slate-200 bg-slate-50 px-4 py-2 overflow-x-auto gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("vacancies")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "vacancies" ? "bg-[#003366] text-white" : "text-slate-700 bg-white border border-slate-200"
            }`}
          >
            Vacancies ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("apply")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "apply" ? "bg-[#003366] text-white" : "text-slate-700 bg-white border border-slate-200"
            }`}
          >
            Submit Application
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "track" ? "bg-[#003366] text-white" : "text-slate-700 bg-white border border-slate-200"
            }`}
          >
            Track Status
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === "about" ? "bg-[#003366] text-white" : "text-slate-700 bg-white border border-slate-200"
            }`}
          >
            About Council
          </button>
          <button
            onClick={onSwitchToAdmin}
            className="px-3 py-1.5 rounded-md whitespace-nowrap bg-amber-50 text-amber-800 border border-amber-200 font-bold ml-auto cursor-pointer"
          >
            Admin Sign-In
          </button>
        </div>
      </header>

      {/* 2. Institutional Notice Banner */}
      <div className="bg-slate-100 border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Equal Opportunity Employer:</strong> The HSRC is committed to employment equity and diversity in social science scholarship.
            </span>
          </div>
          <div className="text-slate-500 text-[11px] font-medium">
            No application fees are ever required for HSRC positions.
          </div>
        </div>
      </div>

      {/* 3. Main Portal View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "vacancies" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Academic & Professional Research Vacancies
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Discover career opportunities across HSRC research divisions in Pretoria, Cape Town, Durban, and Sweetwaters.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab("track")}
                  className="cursor-pointer text-xs"
                >
                  <Search className="w-3.5 h-3.5 mr-1 text-[#008080]" />
                  Check Application Status
                </Button>
              </div>
            </div>

            <JobVacanciesExplorer
              jobs={jobs}
              onApplyForJob={handleApplyForJob}
              onOpenPostJob={undefined} // Hidden in applicant portal
            />
          </div>
        )}

        {activeTab === "apply" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Submit Candidate Dossier
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete the standardized 3-step application with academic credentials, ORCID identifier, and CV.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab("vacancies")}
                className="cursor-pointer text-xs"
              >
                Back to Vacancies
              </Button>
            </div>

            <JobApplicationStepForm
              jobs={jobs}
              preselectedJobId={currentPreselectedJobId}
              onSuccessSubmit={async (candData) => {
                const res = await onApplySubmit(candData);
                if (res) {
                  // Switch to track tab after submission
                  setTimeout(() => {
                    setActiveTab("track");
                  }, 2000);
                }
                return res;
              }}
              onCancel={() => setActiveTab("vacancies")}
            />
          </div>
        )}

        {activeTab === "track" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Application Status & Selection Progress
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live verification of your dossier status across council eligibility checks and committee sittings.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab("vacancies")}
                className="cursor-pointer text-xs"
              >
                Explore More Vacancies
              </Button>
            </div>

            <ApplicationStatusTracker
              candidates={candidates}
              jobs={jobs}
              onNavigateToApply={() => setActiveTab("apply")}
              onNavigateToVacancies={() => setActiveTab("vacancies")}
            />
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-4xl mx-auto space-y-8 py-4">
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <Badge variant="primary" size="sm">
                  Human Sciences Research Council
                </Badge>
                <h2 className="text-2xl font-bold text-slate-900 font-serif">
                  Research Careers at the Forefront of Social Science
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Established in 1968, the Human Sciences Research Council (HSRC) is South Africa's statutory research agency mandated to produce critical social science insights that inform public policy, address inequality, and support transformative human development.
                </p>
              </div>

              {/* Research Divisions */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Core Research Impact Divisions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <h4 className="font-bold text-xs text-[#003366]">Human and Social Capabilities (HSC)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Investigating public health, HIV/AIDS surveillance, youth health behaviors, and mental wellness interventions.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <h4 className="font-bold text-xs text-[#003366]">Inclusive Economic Development (IED)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Focusing on structural employment, agrarian transformation, rural livelihoods, and industrial innovation.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <h4 className="font-bold text-xs text-[#003366]">Developmental, Capable and Ethical State (DCES)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Examining governance, constitutional democracy, electoral studies, and public service performance.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <h4 className="font-bold text-xs text-[#003366]">Centre for Science, Technology and Innovation (CeSTII)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Conducting South Africa's official National R&D and Innovation Surveys for national science policy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recruitment Standards */}
              <div className="p-5 rounded-lg bg-[#003366]/5 border border-[#003366]/20 space-y-3">
                <h3 className="text-sm font-bold text-[#003366] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00A8B5]" />
                  What We Look for in Academic Candidates
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Peer-Reviewed Research Track Record:</strong> Recognized publications in accredited DHET journals or international scholarly indices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Grant Acquisition Capacity:</strong> Demonstrated capability to secure external grant funding from agencies like the NRF, EU Horizon, Wellcome Trust, or NIH.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>Policy Impact:</strong> Translating research findings into policy briefs, government stakeholder submissions, and societal interventions.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab("vacancies")}
                  className="cursor-pointer"
                >
                  View Active Positions
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-[9px]">
              HSRC
            </div>
            <span>© 2026 Human Sciences Research Council. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <button
              onClick={() => setActiveTab("vacancies")}
              className="hover:text-[#003366] hover:underline cursor-pointer"
            >
              Browse Openings
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className="hover:text-[#003366] hover:underline cursor-pointer"
            >
              Track Application
            </button>
            <button
              onClick={onSwitchToAdmin}
              className="hover:text-[#003366] hover:underline cursor-pointer font-bold text-[#003366] flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-[#008080]" />
              Staff & Selection Committee Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
