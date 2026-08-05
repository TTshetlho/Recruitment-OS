import React, { useState, useEffect } from "react";
import { Candidate, JobOpening } from "./types";
import HSRCCareersPortal from "./components/HSRCCareersPortal";

export default function App() {
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [jobsRes, candidatesRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/candidates")
      ]);

      const jobsData = await jobsRes.json();
      const candidatesData = await candidatesRes.json();

      setJobs(jobsData);
      setCandidates(candidatesData);
    } catch (err) {
      console.error("Error fetching database:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFromHsrcPortal = async (candData: {
    jobId: string;
    name: string;
    email: string;
    phone: string;
    orcid: string;
    researchProposal: string;
    cvTextRaw: string;
  }): Promise<boolean> => {
    try {
      // 1. Create the base candidate
      const createRes = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: candData.jobId,
          name: candData.name,
          email: candData.email,
          phone: candData.phone,
          orcid: candData.orcid,
          researchProposal: candData.researchProposal,
          cvTextRaw: candData.cvTextRaw,
        }),
      });

      if (!createRes.ok) return false;
      let newCand = await createRes.json();

      // 2. Parse the CV via Gemini if raw text exists
      if (candData.cvTextRaw.trim().length > 10) {
        try {
          const parseRes = await fetch("/api/candidates/parse-cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cvText: candData.cvTextRaw }),
          });

          if (parseRes.ok) {
            const parseData = await parseRes.json();
            const parsedDetails = parseData.parsedData;

            // Save parsed details to candidate
            const saveRes = await fetch(`/api/candidates/${newCand.id}/academic-fields`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orcid: candData.orcid || parsedDetails.orcid,
                hIndex: parsedDetails.hIndex || 0,
                publications: parsedDetails.publications,
              }),
            });

            if (saveRes.ok) {
              const updatedCandidate = await saveRes.json();
              updatedCandidate.cvParsedData = parsedDetails;
              newCand = updatedCandidate;
            }
          }
        } catch (err) {
          console.error("Gemini automatic parse failed, falling back to basic details:", err);
        }
      }

      // Refresh database records
      const refreshedCandRes = await fetch("/api/candidates");
      if (refreshedCandRes.ok) {
        const list = await refreshedCandRes.json();
        setCandidates(list);
      }
      return true;
    } catch (error) {
      console.error("Error submitting portal application:", error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#003566] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium font-sans">Loading HSRC Career Vacancies...</p>
        </div>
      </div>
    );
  }

  return (
    <HSRCCareersPortal
      jobs={jobs}
      candidates={candidates}
      onApplyCandidate={handleApplyFromHsrcPortal}
    />
  );
}
