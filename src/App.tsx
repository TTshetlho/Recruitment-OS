import React, { useState, useEffect } from "react";
import { Candidate, JobOpening } from "./types";
import { GlobalHeader, PortalTab } from "./components/GlobalHeader";
import { PageHeader } from "./components/PageHeader";
import { JobVacanciesExplorer } from "./components/JobVacanciesExplorer";
import { CandidateDashboardTable } from "./components/CandidateDashboardTable";
import { JobApplicationStepForm } from "./components/JobApplicationStepForm";
import { DesignTokensShowcase } from "./components/DesignTokensShowcase";
import { PostJobModal } from "./components/PostJobModal";
import { PlusCircle, Search, FileText, CheckCircle2, Sliders, ExternalLink } from "lucide-react";
import { Badge } from "./components/design-system/Badge";

export default function App() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<PortalTab>("vacancies");
  
  // User role state: "applicant" or "recruiter"
  const [userRole, setUserRole] = useState<"applicant" | "recruiter">("recruiter");

  // Preselected job for application flow
  const [preselectedJobId, setPreselectedJobId] = useState<string | undefined>(undefined);

  // Post Job modal state
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [jobsRes, candidatesRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/candidates"),
      ]);

      const jobsData = await jobsRes.json();
      const candidatesData = await candidatesRes.json();

      setJobs(jobsData || []);
      setCandidates(candidatesData || []);
    } catch (err) {
      console.error("Error fetching initial database:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForJob = (job: JobOpening) => {
    setPreselectedJobId(job.id);
    setActiveTab("apply");
  };

  const handleApplySubmit = async (candData: {
    jobId: string;
    name: string;
    email: string;
    phone: string;
    orcid?: string;
    scholarLink?: string;
    researchProposal?: string;
    cvTextRaw?: string;
  }): Promise<boolean> => {
    try {
      // 1. Create candidate
      const createRes = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: candData.jobId,
          name: candData.name,
          email: candData.email,
          phone: candData.phone,
          orcid: candData.orcid || "",
          scholarLink: candData.scholarLink || "",
          researchProposal: candData.researchProposal || "",
          cvTextRaw: candData.cvTextRaw || "",
        }),
      });

      if (!createRes.ok) return false;
      const newCand = await createRes.json();

      // 2. Parse CV if text exists
      if (candData.cvTextRaw && candData.cvTextRaw.trim().length > 15) {
        try {
          const parseRes = await fetch("/api/candidates/parse-cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvText: candData.cvTextRaw }),
          });

          if (parseRes.ok) {
            const parseData = await parseRes.json();
            const parsedDetails = parseData.parsedData;

            await fetch(`/api/candidates/${newCand.id}/academic-fields`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orcid: candData.orcid || parsedDetails.orcid,
                hIndex: parsedDetails.hIndex || 0,
                publications: parsedDetails.publications || [],
              }),
            });
          }
        } catch (e) {
          console.error("Optional CV parsing error:", e);
        }
      }

      // Refresh candidate records
      const refreshedRes = await fetch("/api/candidates");
      if (refreshedRes.ok) {
        const list = await refreshedRes.json();
        setCandidates(list);
      }
      return true;
    } catch (err) {
      console.error("Submission failed:", err);
      return false;
    }
  };

  const handleUpdateCandidateStage = async (candId: string, newStage: Candidate["stage"]) => {
    try {
      const res = await fetch(`/api/candidates/${candId}/stage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candId ? { ...c, stage: newStage } : c))
        );
      }
    } catch (err) {
      console.error("Error updating stage:", err);
    }
  };

  const handleCreateJob = async (newJobData: any) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJobData),
      });

      if (res.ok) {
        const created = await res.json();
        setJobs((prev) => [created, ...prev]);
        setActiveTab("vacancies");
      }
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#003366] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#003366] uppercase tracking-wider">
            Loading HSRC Recruitment Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col selection:bg-[#00A8B5]/20 selection:text-[#003366]">
      {/* 1. Global Header Component */}
      <GlobalHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userRole}
        onToggleRole={() => setUserRole((r) => (r === "recruiter" ? "applicant" : "recruiter"))}
        onOpenPostJob={() => setIsPostJobModalOpen(true)}
      />

      {/* 2. Standardized Page Hierarchy Header */}
      {activeTab === "vacancies" && (
        <PageHeader
          title="Current Job Vacancies"
          subtitle="Explore active research, academic, and executive career opportunities across the Human Sciences Research Council in South Africa."
          breadcrumbs={[{ label: "Career Opportunities" }]}
          tag={
            <Badge variant="primary" size="sm">
              {jobs.length} Active Positions
            </Badge>
          }
          primaryAction={{
            label: "Submit Application",
            onClick: () => {
              setPreselectedJobId(undefined);
              setActiveTab("apply");
            },
            icon: <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />,
          }}
          secondaryAction={
            userRole === "recruiter"
              ? {
                  label: "Post New Vacancy",
                  onClick: () => setIsPostJobModalOpen(true),
                  icon: <PlusCircle className="w-4 h-4 text-slate-500" />,
                }
              : undefined
          }
        />
      )}

      {activeTab === "dashboard" && (
        <PageHeader
          title="Candidate Application Dashboard"
          subtitle="Real-time recruitment pipeline table tracking submitted applicant dossiers, ORCID identifiers, and review stages."
          breadcrumbs={[
            { label: "Talent Acquisition", onClick: () => setActiveTab("vacancies") },
            { label: "Application Table" },
          ]}
          tag={
            <Badge variant="shortlisted" size="sm">
              {candidates.length} Registered Dossiers
            </Badge>
          }
          primaryAction={{
            label: "Search Vacancies",
            variant: "secondary",
            onClick: () => setActiveTab("vacancies"),
            icon: <Search className="w-4 h-4 text-[#008080]" />,
          }}
          secondaryAction={{
            label: "New Application Form",
            onClick: () => setActiveTab("apply"),
            icon: <FileText className="w-4 h-4 text-slate-500" />,
          }}
        />
      )}

      {activeTab === "apply" && (
        <PageHeader
          title="Job Application Submission"
          subtitle="Standardized 3-step application workflow with live validation, ORCID verification, and automated CV ingestion."
          breadcrumbs={[
            { label: "Vacancies", onClick: () => setActiveTab("vacancies") },
            { label: "Application Form (Steps 1-3)" },
          ]}
          tag={
            <Badge variant="info" size="sm">
              Step-by-Step Flow
            </Badge>
          }
          primaryAction={{
            label: "Back to Vacancies",
            variant: "secondary",
            onClick: () => setActiveTab("vacancies"),
            icon: <Search className="w-4 h-4 text-[#008080]" />,
          }}
        />
      )}

      {activeTab === "design_system" && (
        <PageHeader
          title="Design Tokens & Component Specifications"
          subtitle="Comprehensive design system guidelines, color palettes, button hierarchies, form input states, and elevation specifications."
          breadcrumbs={[
            { label: "Brand Guidelines", onClick: () => setActiveTab("vacancies") },
            { label: "Component Library" },
          ]}
          tag={
            <Badge variant="secondary" size="sm">
              v2.0 Design System
            </Badge>
          }
          primaryAction={{
            label: "Explore Live Portal",
            onClick: () => setActiveTab("vacancies"),
            icon: <Search className="w-4 h-4 text-white" />,
          }}
        />
      )}

      {/* 3. Main Content Container (Consistent 24px Padding & 12-Column Responsive Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === "vacancies" && (
          <JobVacanciesExplorer
            jobs={jobs}
            onApplyForJob={handleApplyForJob}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
          />
        )}

        {activeTab === "dashboard" && (
          <CandidateDashboardTable
            candidates={candidates}
            jobs={jobs}
            userRole={userRole}
            onUpdateCandidateStage={handleUpdateCandidateStage}
            onNavigateToApply={() => setActiveTab("apply")}
          />
        )}

        {activeTab === "apply" && (
          <JobApplicationStepForm
            jobs={jobs}
            preselectedJobId={preselectedJobId}
            onSuccessSubmit={handleApplySubmit}
            onCancel={() => setActiveTab("vacancies")}
          />
        )}

        {activeTab === "design_system" && <DesignTokensShowcase />}
      </main>

      {/* 4. Standardized Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-[9px]">
              HSRC
            </div>
            <span>© 2026 Human Sciences Research Council (HSRC). All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <button
              onClick={() => setActiveTab("design_system")}
              className="hover:text-[#003366] hover:underline cursor-pointer"
            >
              Design System Spec
            </button>
            <button
              onClick={() => setActiveTab("vacancies")}
              className="hover:text-[#003366] hover:underline cursor-pointer"
            >
              Browse Openings
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="hover:text-[#003366] hover:underline cursor-pointer"
            >
              Application Dashboard
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Post Job Modal Dialog */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobCreated={handleCreateJob}
      />
    </div>
  );
}
