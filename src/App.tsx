import React, { useState, useEffect } from "react";
import { Candidate, JobOpening } from "./types";
import { ApplicantPortal } from "./components/ApplicantPortal";
import { AdminPortal } from "./components/AdminPortal";
import { ShieldCheck, UserCheck, ArrowRight, Layers, Sparkles, Globe, Lock } from "lucide-react";

export type PortalMode = "frontend" | "backend";

export default function App() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-level separation: "frontend" (Applicant / Job Seeker) vs "backend" (Admin / Recruiter / Committee)
  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    // Check URL query param if present
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode") || params.get("portal");
      if (modeParam === "admin" || modeParam === "backend") return "backend";
      if (modeParam === "frontend" || modeParam === "applicant") return "frontend";
    }
    // Default to "frontend" for job seeker experience, or recruiter can toggle immediately
    return "frontend";
  });

  // Preselected job when an applicant clicks "Apply" from a job card
  const [preselectedJobId, setPreselectedJobId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Sync portal mode with URL search param without page reload
  const handleSetPortalMode = (mode: PortalMode) => {
    setPortalMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode === "backend" ? "admin" : "careers");
      window.history.pushState({}, "", url.toString());
    }
  };

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
      // 1. Create candidate record
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
            Loading HSRC Recruitment Portal Database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 
        PERSISTENT ENVIRONMENT SWITCHER BAR 
        Allows immediate testing and transition between Front-End (Users/Applicants) and Back-End (Admin/Recruiters)
      */}
      <aside 
        aria-label="Portal Mode Switcher" 
        className="bg-slate-950 text-white px-4 py-2 border-b border-slate-800 text-xs font-medium z-50 sticky top-0"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white/10 px-2 py-0.5 rounded">
              Environment Router
            </span>
            <span className="text-slate-300 text-xs">
              Portal Separation:{" "}
              <strong className={portalMode === "frontend" ? "text-[#00A8B5]" : "text-amber-400"}>
                {portalMode === "frontend" ? "Front-End (Applicant Careers Portal)" : "Back-End (Admin & ATS Workspace)"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetPortalMode("frontend")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                portalMode === "frontend"
                  ? "bg-[#003366] text-white ring-1 ring-[#00A8B5] shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span>Front-End (Users)</span>
            </button>

            <button
              onClick={() => handleSetPortalMode("backend")}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                portalMode === "backend"
                  ? "bg-amber-500 text-slate-950 ring-1 ring-amber-300 shadow-xs"
                  : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Back-End (Admin)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Render Selected Segment */}
      {portalMode === "frontend" ? (
        <ApplicantPortal
          jobs={jobs}
          candidates={candidates}
          onApplySubmit={handleApplySubmit}
          onSwitchToAdmin={() => handleSetPortalMode("backend")}
          preselectedJobId={preselectedJobId}
          onClearPreselectedJob={() => setPreselectedJobId(undefined)}
        />
      ) : (
        <AdminPortal
          jobs={jobs}
          candidates={candidates}
          onRefreshData={fetchInitialData}
          onUpdateCandidateStage={handleUpdateCandidateStage}
          onCreateJob={handleCreateJob}
          onSwitchToPublic={() => handleSetPortalMode("frontend")}
        />
      )}
    </div>
  );
}
