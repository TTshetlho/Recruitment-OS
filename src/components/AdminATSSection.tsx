import React, { useState, useMemo } from "react";
import { Candidate, JobOpening, ATSAssessment } from "../types";
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  Sliders, 
  Briefcase, 
  BarChart3, 
  FileCheck2, 
  TrendingUp, 
  Zap, 
  Eye, 
  RotateCw, 
  Award, 
  Layers, 
  ArrowUpRight, 
  UserCheck, 
  ShieldAlert,
  Percent,
  Check,
  Building2,
  Clock,
  BookOpen,
  ArrowUpDown
} from "lucide-react";
import { Badge, BadgeVariant } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Input } from "./design-system/Input";
import { Card } from "./design-system/Card";
import { Modal } from "./design-system/Modal";

interface AdminATSSectionProps {
  candidates: Candidate[];
  jobs: JobOpening[];
  onRefreshCandidates: () => Promise<void>;
  onUpdateCandidateStage: (candId: string, newStage: Candidate["stage"]) => Promise<void>;
}

export const AdminATSSection: React.FC<AdminATSSectionProps> = ({
  candidates,
  jobs,
  onRefreshCandidates,
  onUpdateCandidateStage,
}) => {
  // Filters & State
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [alignmentFilter, setAlignmentFilter] = useState<"all" | "high" | "moderate" | "low" | "shortlisted" | "unscanned">("all");
  const [sortField, setSortField] = useState<"name" | "probability" | "date" | "stage">("probability");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Auto-shortlisting settings
  const [shortlistThreshold, setShortlistThreshold] = useState<number>(75);
  const [autoShortlistOnScan, setAutoShortlistOnScan] = useState<boolean>(true);
  
  // Scanning state
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [isBatchScanning, setIsBatchScanning] = useState<boolean>(false);
  const [batchScanStatus, setBatchScanStatus] = useState<string | null>(null);

  // Detailed ATS Modal
  const [inspectingCandidate, setInspectingCandidate] = useState<Candidate | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "requirements" | "responsibilities" | "bibliometrics">("overview");

  // Job Map
  const jobMap = useMemo(() => {
    const map = new Map<string, JobOpening>();
    jobs.forEach((j) => map.set(j.id, j));
    return map;
  }, [jobs]);

  // High-level statistics
  const stats = useMemo(() => {
    const relevantCandidates = selectedJobId === "all" 
      ? candidates 
      : candidates.filter((c) => c.jobId === selectedJobId);

    const total = relevantCandidates.length;
    const scanned = relevantCandidates.filter((c) => !!c.atsAssessment);
    const scannedCount = scanned.length;
    const shortlistedCount = relevantCandidates.filter((c) => c.stage === "shortlisted").length;
    
    const avgAlignment = scannedCount > 0
      ? Math.round(scanned.reduce((acc, c) => acc + (c.atsAssessment?.probabilityOfAlignment || 0), 0) / scannedCount)
      : 0;

    const highAlignmentCount = scanned.filter((c) => (c.atsAssessment?.probabilityOfAlignment || 0) >= 80).length;
    const autoShortlistedCount = scanned.filter((c) => c.atsAssessment?.autoShortlisted).length;

    return {
      total,
      scannedCount,
      shortlistedCount,
      avgAlignment,
      highAlignmentCount,
      autoShortlistedCount,
    };
  }, [candidates, selectedJobId]);

  // Candidates filtering & sorting
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      // 1. Job filter
      if (selectedJobId !== "all" && cand.jobId !== selectedJobId) {
        return false;
      }

      // 2. Search query
      const q = searchQuery.toLowerCase().trim();
      const job = jobMap.get(cand.jobId);
      const matchesSearch =
        !q ||
        cand.name.toLowerCase().includes(q) ||
        cand.email.toLowerCase().includes(q) ||
        (job && job.title.toLowerCase().includes(q)) ||
        (cand.orcid && cand.orcid.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 3. Alignment / status filter
      const prob = cand.atsAssessment?.probabilityOfAlignment ?? null;
      if (alignmentFilter === "high") {
        return prob !== null && prob >= 80;
      }
      if (alignmentFilter === "moderate") {
        return prob !== null && prob >= 50 && prob < 80;
      }
      if (alignmentFilter === "low") {
        return prob !== null && prob < 50;
      }
      if (alignmentFilter === "shortlisted") {
        return cand.stage === "shortlisted";
      }
      if (alignmentFilter === "unscanned") {
        return !cand.atsAssessment;
      }

      return true;
    }).sort((a, b) => {
      let diff = 0;
      if (sortField === "probability") {
        const pA = a.atsAssessment?.probabilityOfAlignment ?? -1;
        const pB = b.atsAssessment?.probabilityOfAlignment ?? -1;
        diff = pA - pB;
      } else if (sortField === "name") {
        diff = a.name.localeCompare(b.name);
      } else if (sortField === "date") {
        diff = (a.dateApplied || "").localeCompare(b.dateApplied || "");
      } else if (sortField === "stage") {
        diff = a.stage.localeCompare(b.stage);
      }
      return sortAsc ? diff : -diff;
    });
  }, [candidates, selectedJobId, searchQuery, alignmentFilter, sortField, sortAsc, jobMap]);

  // Single candidate ATS Scan
  const handleScanCandidate = async (candidateId: string) => {
    try {
      setScanningId(candidateId);
      const res = await fetch(`/api/ats/scan/${candidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoShortlistThreshold: shortlistThreshold,
          forceStageUpdate: autoShortlistOnScan,
        }),
      });

      if (res.ok) {
        await onRefreshCandidates();
        // If modal is open for this candidate, refresh modal view
        if (inspectingCandidate && inspectingCandidate.id === candidateId) {
          const updatedRes = await fetch("/api/candidates");
          if (updatedRes.ok) {
            const list: Candidate[] = await updatedRes.json();
            const found = list.find((c) => c.id === candidateId);
            if (found) setInspectingCandidate(found);
          }
        }
      }
    } catch (err) {
      console.error("ATS scan error:", err);
    } finally {
      setScanningId(null);
    }
  };

  // Batch ATS Scan for selected job or all
  const handleBatchScan = async () => {
    try {
      setIsBatchScanning(true);
      setBatchScanStatus("Initiating deep ATS scans across candidate dossiers...");
      
      const res = await fetch("/api/ats/batch-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobId,
          threshold: shortlistThreshold,
          autoShortlist: autoShortlistOnScan,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBatchScanStatus(`Completed: Scanned ${data.scannedCount} applicant(s). ${data.autoShortlistedCount} auto-shortlisted.`);
        await onRefreshCandidates();
        setTimeout(() => setBatchScanStatus(null), 5000);
      } else {
        setBatchScanStatus("Batch ATS scan encountered an issue.");
      }
    } catch (err) {
      console.error("Batch ATS scan failed:", err);
      setBatchScanStatus("Network error during batch ATS scan.");
    } finally {
      setIsBatchScanning(false);
    }
  };

  // Direct Auto-Shortlist for all candidates meeting threshold
  const handleTriggerAutoShortlist = async () => {
    try {
      const res = await fetch("/api/ats/auto-shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobId,
          threshold: shortlistThreshold,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully auto-shortlisted ${data.updatedCount} qualified candidate(s) with alignment score >= ${shortlistThreshold}%.`);
        await onRefreshCandidates();
      }
    } catch (err) {
      console.error("Error auto-shortlisting:", err);
    }
  };

  // Helper for alignment probability badges
  const getProbabilityBadge = (prob?: number) => {
    if (prob === undefined || prob === null) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <Clock className="w-3 h-3" />
          Unscanned
        </span>
      );
    }

    if (prob >= 85) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-400/20">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {prob}% • Strong Fit
        </span>
      );
    }
    if (prob >= 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008080]" />
          {prob}% • Good Match
        </span>
      );
    }
    if (prob >= 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          {prob}% • Moderate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        {prob}% • Low Alignment
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive ATS Control Banner */}
      <div className="bg-gradient-to-r from-[#003366] via-[#0A4B83] to-[#003366] text-white rounded-[8px] p-6 shadow-md border border-[#002244]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00A8B5]/20 text-[#00A8B5] border border-[#00A8B5]/40 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                Automated ATS Engine
              </span>
              <span className="text-xs text-slate-300">Candidate Compatibility & Alignment AI</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Recruiter Admin: ATS Screening & Shortlisting</h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              Automated scanning evaluates applicant qualifications against specific job requirements, description, and key responsibilities. 
              Compute real-time alignment probabilities and trigger automated or manual shortlisting for the HSRC recruitment pipeline.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              className="bg-[#00A8B5] hover:bg-[#00919d] text-slate-950 font-bold border-none shadow-sm"
              isLoading={isBatchScanning}
              onClick={handleBatchScan}
              leftIcon={<Zap className="w-4 h-4 fill-slate-950" />}
            >
              Run Batch ATS Scan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              onClick={handleTriggerAutoShortlist}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />}
            >
              Auto-Shortlist ({shortlistThreshold}%+)
            </Button>
          </div>
        </div>

        {batchScanStatus && (
          <div className="mt-4 p-3 rounded-[6px] bg-white/10 border border-white/20 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in-50">
            <Sparkles className="w-4 h-4 text-[#00A8B5] shrink-0" />
            <span>{batchScanStatus}</span>
          </div>
        )}
      </div>

      {/* 2. Real-time KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Applicants</p>
          <p className="text-2xl font-bold text-[#003366]">{stats.total}</p>
          <p className="text-[10px] text-slate-400">In selected vacancy</p>
        </Card>

        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ATS Scanned</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.scannedCount}</span>
            <span className="text-xs text-slate-500">/ {stats.total}</span>
          </div>
          <p className="text-[10px] text-[#008080] font-medium">
            {stats.total > 0 ? Math.round((stats.scannedCount / stats.total) * 100) : 0}% processed
          </p>
        </Card>

        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Alignment</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.avgAlignment}%</p>
          <p className="text-[10px] text-slate-400">Match probability</p>
        </Card>

        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">High Fit (&gt;=80%)</p>
          <p className="text-2xl font-bold text-emerald-800">{stats.highAlignmentCount}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Priority candidates</p>
        </Card>

        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shortlisted</p>
          <p className="text-2xl font-bold text-[#003366]">{stats.shortlistedCount}</p>
          <p className="text-[10px] text-slate-500">In current pipeline</p>
        </Card>

        <Card className="p-4 space-y-1 bg-white">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auto-Shortlisted</p>
          <p className="text-2xl font-bold text-[#008080]">{stats.autoShortlistedCount}</p>
          <p className="text-[10px] text-teal-600 font-semibold">Automated via ATS</p>
        </Card>
      </div>

      {/* 3. Automation Settings & Filter Toolbar */}
      <Card className="p-5 space-y-4">
        {/* Row 1: Target Position & Threshold Config */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Target Job Selector */}
          <div className="flex-1 max-w-md space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#003366]" />
              Select Vacancy to Screen:
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#003366] focus:outline-none shadow-xs"
            >
              <option value="all">All Vacancies ({candidates.length} Applicants)</option>
              {jobs.map((j) => {
                const count = candidates.filter((c) => c.jobId === j.id).length;
                return (
                  <option key={j.id} value={j.id}>
                    {j.title} ({count} applicants) • {j.referenceNumber}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Shortlisting Threshold & Auto-advance Switch */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-[8px] border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-[#008080]" />
                  Auto-Shortlist Threshold:
                </span>
                <span className="text-xs font-mono font-bold text-[#003366] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {shortlistThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={shortlistThreshold}
                onChange={(e) => setShortlistThreshold(parseInt(e.target.value))}
                className="w-48 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#003366]"
              />
              <p className="text-[10px] text-slate-500">Candidates at or above this alignment score qualify.</p>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden sm:block" />

            {/* Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoShortlistOnScan}
                onChange={(e) => setAutoShortlistOnScan(e.target.checked)}
                className="w-4 h-4 rounded text-[#003366] focus:ring-[#003366] accent-[#003366]"
              />
              <span className="text-xs font-semibold text-slate-700">
                Auto-advance qualified on scan
              </span>
            </label>
          </div>
        </div>

        {/* Row 2: Search & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search candidate name or ORCID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Applicants" },
              { id: "high", label: "High Fit (>= 80%)" },
              { id: "moderate", label: "Moderate (50-79%)" },
              { id: "low", label: "Low Alignment (< 50%)" },
              { id: "shortlisted", label: "Shortlisted Only" },
              { id: "unscanned", label: "Needs Scan" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAlignmentFilter(f.id as any)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-[8px] transition-all cursor-pointer border ${
                  alignmentFilter === f.id
                    ? "bg-[#003366] text-white border-[#003366] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Candidate ATS Screening Table */}
      <div className="bg-white rounded-[8px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <th
                  onClick={() => {
                    if (sortField === "name") setSortAsc(!sortAsc);
                    else { setSortField("name"); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate & Academic Profile</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Applied Vacancy</th>
                <th
                  onClick={() => {
                    if (sortField === "probability") setSortAsc(!sortAsc);
                    else { setSortField("probability"); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Probability of Alignment</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Requirements Match</th>
                <th
                  onClick={() => {
                    if (sortField === "stage") setSortAsc(!sortAsc);
                    else { setSortField("stage"); setSortAsc(false); }
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-[#003366]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pipeline Status</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Shortlist Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Filter className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">No matching applicants found</h4>
                      <p className="text-xs text-slate-500">
                        Adjust your filter criteria, select another vacancy, or clear the search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const job = jobMap.get(cand.jobId);
                  const assessment = cand.atsAssessment;
                  const prob = assessment?.probabilityOfAlignment;
                  const initials = cand.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  const isScanningThis = scanningId === cand.id;

                  // Criteria match count
                  const criteria = assessment?.breakdown?.requirementsMatch?.criteria || [];
                  const matchedCriteriaCount = criteria.filter((c) => c.matched).length;

                  return (
                    <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* 1. Candidate Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[8px] bg-[#003366] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                                {cand.name}
                              </p>
                              {assessment?.autoShortlisted && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#008080] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                  <Sparkles className="w-3 h-3 text-[#00A8B5]" />
                                  Auto-Shortlisted
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
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

                      {/* 2. Position */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          {job ? job.title : "Research Position"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {job?.referenceNumber || "HSRC-VAC"} • {job?.department || "Council-wide"}
                        </p>
                      </td>

                      {/* 3. Probability of Alignment & Score Meter */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          {getProbabilityBadge(prob)}
                          {prob !== undefined && (
                            <div className="w-36 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  prob >= 80 ? "bg-emerald-500" : prob >= 50 ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Requirements Criteria Summary */}
                      <td className="py-4 px-4">
                        {assessment ? (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {matchedCriteriaCount} / {criteria.length} criteria met
                            </span>
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {assessment.breakdown.requirementsMatch.summary}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Scan pending</span>
                        )}
                      </td>

                      {/* 5. Pipeline Stage */}
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            cand.stage === "shortlisted"
                              ? "shortlisted"
                              : cand.stage === "rejected"
                              ? "rejected"
                              : cand.stage === "committee_review"
                              ? "in_review"
                              : "applied"
                          }
                        >
                          {cand.stage === "committee_review" ? "In Review" : cand.stage.toUpperCase()}
                        </Badge>
                      </td>

                      {/* 6. Action Controls */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Run / Rerun Scan */}
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={isScanningThis}
                            onClick={() => handleScanCandidate(cand.id)}
                            title="Run ATS Scan for this candidate"
                            leftIcon={<RotateCw className="w-3.5 h-3.5 text-slate-500" />}
                          >
                            {assessment ? "Rescan" : "Scan ATS"}
                          </Button>

                          {/* Quick Manual Shortlist / Un-shortlist */}
                          {cand.stage !== "shortlisted" ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => onUpdateCandidateStage(cand.id, "shortlisted")}
                              leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            >
                              Shortlist
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-700 hover:bg-rose-50"
                              onClick={() => onUpdateCandidateStage(cand.id, "applied")}
                            >
                              Revert
                            </Button>
                          )}

                          {/* View Full Report */}
                          {assessment && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setInspectingCandidate(cand);
                                setActiveReportTab("overview");
                              }}
                              leftIcon={<Eye className="w-3.5 h-3.5" />}
                            >
                              Report
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ATS Deep-Dive Assessment Modal */}
      {inspectingCandidate && inspectingCandidate.atsAssessment && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingCandidate(null)}
          title={`ATS Compatibility Dossier: ${inspectingCandidate.name}`}
          subtitle={`Probability of Alignment with ${jobMap.get(inspectingCandidate.jobId)?.title || "Target Vacancy"}`}
          maxWidth="4xl"
          footer={
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Change Candidate Stage:</span>
                <select
                  value={inspectingCandidate.stage}
                  onChange={(e) => {
                    const newStage = e.target.value as Candidate["stage"];
                    onUpdateCandidateStage(inspectingCandidate.id, newStage);
                    setInspectingCandidate({ ...inspectingCandidate, stage: newStage });
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-[8px] border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-[#003366]"
                >
                  <option value="applied">Applied (Standard)</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="committee_review">In Committee Review</option>
                  <option value="seminar">Seminar / Interview</option>
                  <option value="offer">Offer Extended</option>
                  <option value="rejected">Rejected / Unsuccessful</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectingCandidate(null)}
                >
                  Close
                </Button>
                {inspectingCandidate.stage !== "shortlisted" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    onClick={async () => {
                      await onUpdateCandidateStage(inspectingCandidate.id, "shortlisted");
                      setInspectingCandidate({ ...inspectingCandidate, stage: "shortlisted" });
                    }}
                  >
                    Shortlist Candidate Now
                  </Button>
                )}
              </div>
            </div>
          }
        >
          {(() => {
            const asm = inspectingCandidate.atsAssessment!;
            const job = jobMap.get(inspectingCandidate.jobId);

            return (
              <div className="space-y-6">
                {/* Highlight Scorecard */}
                <div className="bg-gradient-to-br from-slate-900 via-[#003366] to-slate-900 text-white rounded-[8px] p-6 shadow-md border border-[#002244]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-slate-200">
                          Verdict: {asm.verdict}
                        </span>
                        <span className="text-xs text-slate-300 font-mono">
                          Confidence: {asm.confidenceScore}%
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{inspectingCandidate.name}</h3>
                      <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
                        {asm.executiveSummary}
                      </p>
                    </div>

                    {/* Probability Gauge Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-[8px] p-4 border border-white/20 text-center min-w-[180px] shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                        Alignment Probability
                      </p>
                      <div className="text-4xl font-black text-[#00A8B5] my-1">
                        {asm.probabilityOfAlignment}%
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 my-2 overflow-hidden">
                        <div
                          className="bg-[#00A8B5] h-full rounded-full"
                          style={{ width: `${asm.probabilityOfAlignment}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium">
                        Composite: {asm.overallScore}/100
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center space-x-1 border-b border-slate-200">
                  {[
                    { id: "overview", label: "Executive Summary & Keywords" },
                    { id: "requirements", label: "Mandatory Requirements Match" },
                    { id: "responsibilities", label: "Job Description & Responsibilities" },
                    { id: "bibliometrics", label: "Academic Bibliometrics & Impact" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveReportTab(t.id as any)}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                        activeReportTab === t.id
                          ? "border-[#003366] text-[#003366]"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Overview & Keyword Cloud */}
                {activeReportTab === "overview" && (
                  <div className="space-y-4">
                    {/* ATS Recommendation */}
                    <div className="p-4 rounded-[8px] bg-teal-50 border border-teal-200 text-xs">
                      <p className="font-bold text-[#008080] flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-[#00A8B5]" />
                        Official ATS Hiring Recommendation:
                      </p>
                      <p className="text-slate-700 leading-relaxed">{asm.atsRecommendation}</p>
                    </div>

                    {/* Matched vs Missing Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matched Skills */}
                      <div className="bg-white rounded-[8px] p-4 border border-slate-200 space-y-2.5">
                        <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Matched Technical Skills & Credentials ({asm.matchedKeywords.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {asm.matchedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing or Unverified Skills */}
                      <div className="bg-white rounded-[8px] p-4 border border-slate-200 space-y-2.5">
                        <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Gaps / Unidentified Requirements ({asm.missingKeywords.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {asm.missingKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Mandatory Requirements Breakdown */}
                {activeReportTab === "requirements" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
                      <span>Requirement Criterion</span>
                      <span>Compatibility Score</span>
                    </div>

                    <div className="space-y-3">
                      {asm.breakdown.requirementsMatch.criteria.map((crit, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-[8px] border transition-colors ${
                            crit.matched
                              ? "bg-white border-slate-200 hover:border-emerald-300"
                              : "bg-rose-50/40 border-rose-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {crit.matched ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                )}
                                <p className="text-xs font-bold text-slate-900">{crit.criterion}</p>
                              </div>
                              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                                <span className="font-semibold text-slate-700">Identified Evidence: </span>
                                {crit.evidence}
                              </p>
                            </div>

                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                                crit.score >= 80
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : crit.score >= 50
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              {crit.score}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Job Description & Key Responsibilities */}
                {activeReportTab === "responsibilities" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-[8px] border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                        Domain & Role Mandate Fit ({asm.breakdown.jobDescriptionFit.score}/100)
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {asm.breakdown.jobDescriptionFit.summary}
                      </p>
                      <p className="text-xs text-slate-500 italic">
                        {asm.breakdown.jobDescriptionFit.domainRelevance}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-[8px] border border-slate-200 space-y-3">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Key Responsibilities Delivery Capability ({asm.breakdown.keyResponsibilitiesAlignment.score}/100)
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {asm.breakdown.keyResponsibilitiesAlignment.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="font-bold text-emerald-800 mb-1.5">Identified Competencies:</p>
                          <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {asm.breakdown.keyResponsibilitiesAlignment.competenciesIdentified.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-bold text-amber-800 mb-1.5">Unverified / Missing Competencies:</p>
                          <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {asm.breakdown.keyResponsibilitiesAlignment.competenciesMissing.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Academic Bibliometrics */}
                {activeReportTab === "bibliometrics" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-[8px] border border-slate-200 space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Citation Metric</p>
                        <p className="text-lg font-bold text-[#003366]">h-Index: {inspectingCandidate.hIndex ?? 0}</p>
                        <p className="text-xs text-slate-600">{asm.breakdown.academicBibliometrics.hIndexEvaluation}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-[8px] border border-slate-200 space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Peer-Reviewed Pubs</p>
                        <p className="text-lg font-bold text-[#003366]">
                          {inspectingCandidate.publications?.length || inspectingCandidate.cvParsedData?.publications?.length || 0} Publications
                        </p>
                        <p className="text-xs text-slate-600">{asm.breakdown.academicBibliometrics.publicationEvaluation}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-[8px] border border-slate-200 space-y-1">
                        <p className="text-[11px] font-bold text-slate-500 uppercase">Grant Capacity</p>
                        <p className="text-lg font-bold text-[#008080]">Competitive Grants</p>
                        <p className="text-xs text-slate-600">{asm.breakdown.academicBibliometrics.grantCapacity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
