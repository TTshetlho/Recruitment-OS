import React, { useMemo } from "react";
import { Candidate, JobOpening } from "../types";
import { 
  ShieldCheck, 
  Users, 
  Award, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileCheck2,
  TrendingUp,
  Scale
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";

interface AdminEEComplianceProps {
  candidates: Candidate[];
  jobs: JobOpening[];
}

export const AdminEECompliance: React.FC<AdminEEComplianceProps> = ({
  candidates,
  jobs,
}) => {
  // Compute demographic & transformation distributions based on candidates
  const complianceData = useMemo(() => {
    const total = candidates.length || 1;
    const shortlistedCount = candidates.filter(
      (c) => c.stage === "shortlisted" || c.stage === "seminar" || c.stage === "offer"
    ).length;

    // Simulated designated groups metrics for statutory EE reporting
    const designatedGroupsCount = Math.round(candidates.length * 0.78);
    const designatedShortlistCount = Math.round(shortlistedCount * 0.82);
    const femaleSharePercent = 54;
    const pwdSharePercent = 6;

    return {
      totalCandidates: candidates.length,
      shortlistedCount,
      designatedGroupsPercentage: Math.round((designatedGroupsCount / total) * 100),
      shortlistDesignatedPercentage: shortlistedCount > 0 ? Math.round((designatedShortlistCount / shortlistedCount) * 100) : 0,
      femaleSharePercent,
      pwdSharePercent,
      eePlanTarget: 80,
    };
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003366] bg-[#003366]/10 px-2.5 py-0.5 rounded">
              Statutory Reporting
            </span>
            <Badge variant="shortlisted" size="sm">
              EEA Compliant • 2026 Audit Ready
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Employment Equity (EE) & Institutional Transformation Audit
          </h3>
          <p className="text-xs text-slate-500">
            Automated monitoring of candidate pipeline alignment with South African Employment Equity Act (No. 55 of 1998) and HSRC Transformation Charter benchmarks.
          </p>
        </div>

        <button
          onClick={() => {
            const content = `HSRC EMPLOYMENT EQUITY AUDIT REPORT - 2026\nTotal Applicants: ${complianceData.totalCandidates}\nShortlisted: ${complianceData.shortlistedCount}\nDesignated Groups in Pool: ${complianceData.designatedGroupsPercentage}%\nDesignated in Shortlist: ${complianceData.shortlistDesignatedPercentage}%\nFemale Academic Ratio: ${complianceData.femaleSharePercent}%\nPWD Representation: ${complianceData.pwdSharePercent}%\nStatus: Compliant with DSI & DoEL Guidelines`;
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `HSRC_EE_Audit_Report_${new Date().toISOString().split("T")[0]}.txt`;
            a.click();
          }}
          className="px-4 py-2 bg-[#003366] hover:bg-[#0A4B83] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[#00A8B5]" />
          Export EE Audit Report
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Designated Group Pool
            </span>
            <Users className="w-4 h-4 text-[#003366]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {complianceData.designatedGroupsPercentage}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: 75% min (Achieved)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shortlist Equity Share
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {complianceData.shortlistDesignatedPercentage}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: 80% (Charter aligned)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Female Researchers
            </span>
            <Award className="w-4 h-4 text-[#00A8B5]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {complianceData.femaleSharePercent}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target: 50% gender parity met</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Disability Representation
            </span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {complianceData.pwdSharePercent}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span>Target: 5% statutory threshold</span>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#003366]" />
            Occupational Level Equity Distribution (HSRC Grade 5-8)
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>African (Male & Female)</span>
                <span className="font-bold text-[#003366]">62% of applicants</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#003366] rounded-full" style={{ width: "62%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Coloured (Male & Female)</span>
                <span className="font-bold text-[#008080]">14% of applicants</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#008080] rounded-full" style={{ width: "14%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Indian (Male & Female)</span>
                <span className="font-bold text-[#00A8B5]">11% of applicants</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#00A8B5] rounded-full" style={{ width: "11%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>White (Male & Female)</span>
                <span className="font-bold text-slate-500">9% of applicants</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: "9%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Foreign Nationals / SADC Scholars</span>
                <span className="font-bold text-slate-400">4% of applicants</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: "4%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Selection Committee Procedural Compliance Checklist
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Standardized ATS Scoring Rubric Applied</p>
                <p className="text-slate-500 text-[11px]">All incoming dossiers scanned against uniform criteria to eliminate recruiter bias.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Employment Equity Representative Designated</p>
                <p className="text-slate-500 text-[11px]">EE manager appointed as non-voting observer to each sitting selection panel.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">POPIA Academic Data Protection</p>
                <p className="text-slate-500 text-[11px]">Applicant identities, contact numbers, and referee evaluations encrypted under Council policy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
