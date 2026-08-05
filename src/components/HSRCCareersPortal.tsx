import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Calendar, 
  User, 
  Lock, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  LogOut, 
  Globe, 
  ChevronDown,
  Building,
  Plus,
  FileText
} from "lucide-react";
import { JobOpening, Candidate } from "../types";

interface HSRCCareersPortalProps {
  jobs: JobOpening[];
  candidates: Candidate[];
  onApplyCandidate: (candData: any) => Promise<boolean>;
  onBackToAdmin?: () => void;
}

export default function HSRCCareersPortal({
  jobs,
  candidates,
  onApplyCandidate,
  onBackToAdmin
}: HSRCCareersPortalProps) {
  // Navigation tabs
  // "search" | "vacancies" | "categories" | "login" | "signup"
  const [subTab, setSubTab] = useState<"search" | "vacancies" | "categories" | "login" | "signup">("search");

  // Search parameters
  const [searchCategory, setSearchCategory] = useState<string>("All Categories");
  const [searchRefNum, setSearchRefNum] = useState<string>("");
  const [searchJobTitle, setSearchJobTitle] = useState<string>("");
  const [searchWorkplaceType, setSearchWorkplaceType] = useState<string>("Select");
  const [searchProvince, setSearchProvince] = useState<string>("Select");
  const [searchTownCity, setSearchTownCity] = useState<string>("");

  // Logged-in seeker state
  const [seekerEmail, setSeekerEmail] = useState<string>("");
  const [seekerPassword, setSeekerPassword] = useState<string>("");
  const [seekerName, setSeekerName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Sign up state
  const [signupName, setSignupName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");

  // Interactive selected job for detail view
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);

  // Active applying state
  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [applyName, setApplyName] = useState<string>("");
  const [applyEmail, setApplyEmail] = useState<string>("");
  const [applyPhone, setApplyPhone] = useState<string>("");
  const [applyOrcid, setApplyOrcid] = useState<string>("");
  const [applyProposal, setApplyProposal] = useState<string>("");
  const [applyCVText, setApplyCVText] = useState<string>("");
  const [submittingApp, setSubmittingApp] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preset categories as shown in Screenshot 3
  const HSRC_CATEGORIES = [
    "Admin",
    "Business Development",
    "Executive",
    "Facilities and OHS",
    "Finance",
    "HR",
    "IT",
    "Legal",
    "Management",
    "Research",
    "Risk Management",
    "Supply Change Management"
  ];

  // Helper to compute job count per category
  const getCategoryCount = (catName: string) => {
    return jobs.filter(j => j.category?.toLowerCase() === catName.toLowerCase()).length;
  };

  // Run Search filtering logic
  const getFilteredJobs = () => {
    return jobs.filter(job => {
      // Category filter
      if (searchCategory !== "All Categories" && job.category?.toLowerCase() !== searchCategory.toLowerCase()) {
        return false;
      }
      // Reference number filter
      if (searchRefNum.trim() !== "" && !job.referenceNumber?.toLowerCase().includes(searchRefNum.toLowerCase()) && !job.grantCode?.toLowerCase().includes(searchRefNum.toLowerCase())) {
        return false;
      }
      // Job title filter
      if (searchJobTitle.trim() !== "" && !job.title.toLowerCase().includes(searchJobTitle.toLowerCase())) {
        return false;
      }
      // Workplace type filter
      if (searchWorkplaceType !== "Select" && job.workplaceType?.toLowerCase() !== searchWorkplaceType.toLowerCase()) {
        return false;
      }
      // Province filter
      if (searchProvince !== "Select" && job.province?.toLowerCase() !== searchProvince.toLowerCase()) {
        return false;
      }
      // Town / City filter
      if (searchTownCity.trim() !== "" && !job.townCity?.toLowerCase().includes(searchTownCity.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const handleRunSearch = () => {
    setSubTab("vacancies");
  };

  const handleCategoryClick = (cat: string) => {
    setSearchCategory(cat);
    setSubTab("vacancies");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    setSubmittingApp(true);
    setSuccessMessage(null);

    const candPayload = {
      jobId: applyingJob.id,
      name: applyName,
      email: applyEmail,
      phone: applyPhone,
      orcid: applyOrcid,
      researchProposal: applyProposal,
      cvTextRaw: applyCVText,
      stage: "applied"
    };

    const success = await onApplyCandidate(candPayload);
    setSubmittingApp(false);
    if (success) {
      setSuccessMessage(`Application submitted successfully for "${applyingJob.title}"! Your record is now active in the recruitment pipeline.`);
      // Clear form
      setApplyName("");
      setApplyEmail("");
      setApplyPhone("");
      setApplyOrcid("");
      setApplyProposal("");
      setApplyCVText("");
      setTimeout(() => {
        setApplyingJob(null);
        setSuccessMessage(null);
        setSubTab("vacancies");
      }, 3500);
    } else {
      alert("There was an issue processing your application. Please verify that your email and credentials are valid.");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seekerEmail.trim()) {
      setSeekerName(seekerEmail.split("@")[0].toUpperCase());
      setIsLoggedIn(true);
      setSubTab("search");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupEmail.trim() && signupName.trim()) {
      setSeekerName(signupName);
      setSeekerEmail(signupEmail);
      setIsLoggedIn(true);
      setSubTab("search");
    }
  };

  const triggerSocialLogin = (platform: string) => {
    setSeekerName(`${platform.toUpperCase()} USER`);
    setSeekerEmail(`${platform.toLowerCase()}@socialauth.hsrc.ac.za`);
    setIsLoggedIn(true);
    setSubTab("search");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      
      {/* HSRC BRAND HEADER (Matches exact visual layout) */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-5 flex items-center justify-between shrink-0">
        {/* Custom HSRC Vector Logo Representation */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSubTab("search")}>
          <div className="relative w-12 h-12 rounded-full border-2 border-[#003566] flex items-center justify-center font-bold text-[#003566] shrink-0">
            {/* Styled Circle with central stick-figure/compass element to replicate the HSRC brand emblem */}
            <div className="absolute inset-0.5 border border-[#003566]/20 rounded-full"></div>
            <div className="w-1.5 h-7 bg-[#003566] rounded-full absolute"></div>
            <div className="w-6 h-1 bg-[#003566] rounded-full absolute top-[14px]"></div>
            <div className="w-5 h-5 rounded-full border-2 border-[#003566] absolute bottom-1"></div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold tracking-tight text-[#003566] font-serif flex items-center gap-1">
              HSRC
            </div>
            <div className="text-[10px] md:text-xs font-semibold tracking-wider text-slate-500 uppercase -mt-1 font-sans">
              Human Sciences Research Council
            </div>
          </div>
        </div>

        {/* Header Tabs: JOBS & ACCOUNT */}
        <nav className="flex items-center gap-8 text-sm font-bold tracking-wide text-[#003566] font-sans">
          <button 
            onClick={() => {
              setSelectedJob(null);
              setSubTab("search");
            }}
            className={`uppercase pb-1.5 border-b-2 hover:border-[#003566] transition-all cursor-pointer ${
              subTab === "search" || subTab === "vacancies" || subTab === "categories" 
                ? "border-[#003566] text-[#003566]" 
                : "border-transparent text-[#003566]/70"
            }`}
          >
            Jobs
          </button>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 bg-slate-100 py-1 px-2.5 rounded-full font-medium">
                👤 {seekerName}
              </span>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  setSeekerEmail("");
                  setSeekerName("");
                  setSubTab("search");
                }}
                title="Log Out"
                className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSubTab("login")}
              className={`uppercase pb-1.5 border-b-2 hover:border-[#003566] transition-all cursor-pointer ${
                subTab === "login" || subTab === "signup" 
                  ? "border-[#003566] text-[#003566]" 
                  : "border-transparent text-[#003566]/70"
              }`}
            >
              Account
            </button>
          )}
        </nav>
      </header>

      {/* SUB-HEADER UTILITIES BAR */}
      <div className="bg-[#f1f5f9] border-b border-slate-200 px-6 md:px-12 py-2.5 flex items-center justify-between text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSubTab("search")} 
            className={`hover:text-[#003566] font-semibold ${subTab === "search" ? "text-[#003566] underline" : ""}`}
          >
            Search
          </button>
          <span>/</span>
          <button 
            onClick={() => setSubTab("vacancies")} 
            className={`hover:text-[#003566] font-semibold ${subTab === "vacancies" ? "text-[#003566] underline" : ""}`}
          >
            Vacancies Board
          </button>
          <span>/</span>
          <button 
            onClick={() => setSubTab("categories")} 
            className={`hover:text-[#003566] font-semibold ${subTab === "categories" ? "text-[#003566] underline" : ""}`}
          >
            Browse Categories
          </button>
        </div>

        <div className="hidden sm:block text-slate-500 font-mono text-[11px]">
          Social Science that makes a difference • South Africa
        </div>
      </div>

      {/* CORE PORTAL CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto">

        {/* ------------------------------------------------------------- */}
        {/* PAGE 1: SEARCH PAGE (Screenshot 1) */}
        {/* ------------------------------------------------------------- */}
        {subTab === "search" && (
          <div className="w-full max-w-4xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">Search</h2>
            
            <div className="space-y-6">
              
              {/* Category Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-4 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-600">Category</label>
                <div className="md:col-span-3 relative">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566] appearance-none"
                  >
                    <option value="All Categories">All Categories</option>
                    {HSRC_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat} ({getCategoryCount(cat)})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reference Number Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-4 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-600">Reference Number</label>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="..."
                    value={searchRefNum}
                    onChange={(e) => setSearchRefNum(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566]"
                  />
                </div>
              </div>

              {/* Job Title Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-4 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-600">Job Title</label>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="..."
                    value={searchJobTitle}
                    onChange={(e) => setSearchJobTitle(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566]"
                  />
                </div>
              </div>

              {/* Workplace Type Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-4 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-600">Workplace Type</label>
                <div className="md:col-span-3 relative">
                  <select
                    value={searchWorkplaceType}
                    onChange={(e) => setSearchWorkplaceType(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566] appearance-none"
                  >
                    <option value="Select">Select</option>
                    <option value="onsite">Office / Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Province Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-4 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-600">Province</label>
                <div className="md:col-span-3 relative">
                  <select
                    value={searchProvince}
                    onChange={(e) => setSearchProvince(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566] appearance-none"
                  >
                    <option value="Select">Select</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">Northern Cape</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Town / City Field */}
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-8 pb-6">
                <label className="text-sm font-bold text-slate-600">Town / City</label>
                <div className="md:col-span-3">
                  <input
                    type="text"
                    placeholder="..."
                    value={searchTownCity}
                    onChange={(e) => setSearchTownCity(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566]"
                  />
                </div>
              </div>

              {/* Run Search Trigger Button */}
              <div className="flex justify-end pt-4">
                <button
                  id="hsrc-run-search-btn"
                  onClick={handleRunSearch}
                  className="px-8 py-3 bg-[#003566] hover:bg-[#002b4d] text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  Run Search
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PAGE 2: VACANCIES TABLE & JOIN OUR TEAM BANNER (Screenshot 2) */}
        {/* ------------------------------------------------------------- */}
        {subTab === "vacancies" && (
          <div className="space-y-8 w-full">
            
            {/* Immersive Blue Banner Graphic (JOIN OUR TEAM) */}
            <div className="w-full bg-[#1e4e79] rounded-xl text-white p-8 md:p-12 relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-200/10">
              {/* Background styling elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-4 max-w-2xl relative z-10">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#93c5fd] font-bold">
                  HSRC Employment Opportunities
                </div>
                <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight uppercase">
                  Join Our Team
                </h2>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans font-light">
                  Make the smart career choice and be part of the research agency that conducts research that generates critical and independent knowledge, relative to all aspects of human and social development.
                </p>
              </div>

              {/* Graphic Ring Representative of Stacked Hands Logo from Screenshot 2 */}
              <div className="shrink-0 relative z-10 w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#93c5fd]/30 animate-spin-slow"></div>
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#002544] rounded-full flex items-center justify-center shadow-inner relative">
                  <div className="absolute w-2 h-6 bg-[#93c5fd] rounded-full -top-1"></div>
                  <div className="absolute w-2 h-6 bg-[#93c5fd] rounded-full -bottom-1"></div>
                  <div className="absolute w-6 h-2 bg-[#93c5fd] rounded-full -left-1"></div>
                  <div className="absolute w-6 h-2 bg-[#93c5fd] rounded-full -right-1"></div>
                  <span className="text-white font-extrabold text-base md:text-lg font-serif">HSRC</span>
                </div>
              </div>
            </div>

            {/* Search Header Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-1 border-b border-slate-200">
              <h3 className="text-xl font-serif font-black text-slate-800">
                Browse by Category &gt; <span className="text-[#003566] font-sans font-semibold text-lg">{searchCategory}</span>
              </h3>
              
              {/* Clear filters utility */}
              {(searchCategory !== "All Categories" || searchRefNum || searchJobTitle || searchWorkplaceType !== "Select" || searchProvince !== "Select" || searchTownCity) && (
                <button
                  onClick={() => {
                    setSearchCategory("All Categories");
                    setSearchRefNum("");
                    setSearchJobTitle("");
                    setSearchWorkplaceType("Select");
                    setSearchProvince("Select");
                    setSearchTownCity("");
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline font-semibold transition-all cursor-pointer"
                >
                  Clear search filters
                </button>
              )}
            </div>

            {/* VACANCIES TABLE GRID */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6 w-7/12">
                        <div className="flex items-center gap-1.5">
                          Job Title <span>⇅</span>
                        </div>
                      </th>
                      <th className="py-4 px-6 w-3/12">
                        <div className="flex items-center gap-1.5">
                          Town / City <span>⇅</span>
                        </div>
                      </th>
                      <th className="py-4 px-6 w-2/12">
                        Date Closing
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {getFilteredJobs().length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 px-6 text-center text-slate-400 italic">
                          No active vacancies currently match your search parameters. Use the tabs above to widen your parameters.
                        </td>
                      </tr>
                    ) : (
                      getFilteredJobs().map((job) => (
                        <tr 
                          key={job.id} 
                          onClick={() => setSelectedJob(job)}
                          className="hover:bg-[#f1f5f9]/40 cursor-pointer transition-colors"
                        >
                          <td className="py-5 px-6 font-semibold text-[#003566] hover:underline">
                            <div className="flex flex-col gap-1">
                              <span>{job.title}</span>
                              <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-400 font-sans">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">Ref: {job.referenceNumber || job.id}</span>
                                <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded uppercase">{job.category}</span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded uppercase">{job.workplaceType}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6 text-slate-600">
                            {job.townCity}
                          </td>
                          <td className="py-5 px-6 font-mono text-xs text-slate-500">
                            {job.dateClosing || "2026/07/24"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Category Dropdown Trigger Button (matching Screenshot 2) */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <div className="relative">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-[#003566] hover:bg-[#002b4d] text-white text-[11px] font-bold uppercase tracking-wider py-2 px-6 pr-10 rounded appearance-none cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                    {HSRC_CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PAGE 3: BROWSE BY CATEGORY VIEW (Screenshot 3) */}
        {/* ------------------------------------------------------------- */}
        {subTab === "categories" && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Browse by Category</h2>
            
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
              {HSRC_CATEGORIES.map((cat, idx) => {
                const count = getCategoryCount(cat);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleCategoryClick(cat)}
                    className="p-4 px-6 flex items-center justify-between hover:bg-[#f1f5f9]/30 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700">{cat} ({count})</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PAGE 4: LOG IN SCREEN (Screenshot 4) */}
        {/* ------------------------------------------------------------- */}
        {subTab === "login" && (
          <div className="w-full max-w-5xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-800 tracking-tight">Log In</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              
              {/* Left Column: Social Logins */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Log In Options</span>
                
                <button
                  onClick={() => triggerSocialLogin("Google")}
                  className="w-full py-3 px-6 bg-[#dd4b39] hover:bg-[#c23b2b] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <span className="text-sm">G</span>
                  Log In With Google
                </button>
                
                <button
                  onClick={() => triggerSocialLogin("Facebook")}
                  className="w-full py-3 px-6 bg-[#3b5998] hover:bg-[#2d4373] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <span className="text-sm">f</span>
                  Log In With Facebook
                </button>

                <button
                  onClick={() => triggerSocialLogin("LinkedIn")}
                  className="w-full py-3 px-6 bg-[#0077b5] hover:bg-[#005987] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <span className="text-sm">in</span>
                  Log In With LinkedIn
                </button>
                
                <div className="pt-4 text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button onClick={() => setSubTab("signup")} className="text-[#003566] font-bold hover:underline">
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Right Column: Email Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Email Log In</span>
                
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={seekerEmail}
                    onChange={(e) => setSeekerEmail(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566]"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={seekerPassword}
                    onChange={(e) => setSeekerPassword(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#003566] focus:border-[#003566]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#003566] hover:bg-[#002240] text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  Log In
                </button>

                <div className="space-y-1 pt-2">
                  <button 
                    type="button"
                    onClick={() => setSubTab("signup")} 
                    className="block text-xs text-[#003566] hover:underline"
                  >
                    Sign up for an account
                  </button>
                  <a href="#forgot" className="block text-xs text-slate-400 hover:underline">
                    Forgot password or account email?
                  </a>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* PAGE 5: SIGN UP FOR AN ACCOUNT SCREEN (Screenshot 5) */}
        {/* ------------------------------------------------------------- */}
        {subTab === "signup" && (
          <div className="w-full max-w-4xl mx-auto space-y-8 bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Sign up for an account</h2>
            
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sign Up Options</span>
              
              <button
                onClick={() => triggerSocialLogin("Google")}
                className="w-full py-3 px-6 bg-[#dd4b39] hover:bg-[#c23b2b] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <span>G</span>
                Sign Up With Google
              </button>

              <button
                onClick={() => triggerSocialLogin("Facebook")}
                className="w-full py-3 px-6 bg-[#3b5998] hover:bg-[#2d4373] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <span>f</span>
                Sign Up With Facebook
              </button>

              <button
                onClick={() => triggerSocialLogin("LinkedIn")}
                className="w-full py-3 px-6 bg-[#0077b5] hover:bg-[#005987] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <span>in</span>
                Sign Up With LinkedIn
              </button>

              {/* Custom Email Signup Accordion Toggle */}
              <div className="border border-slate-100 rounded bg-slate-50/50 p-6 space-y-4">
                <span className="text-xs font-bold text-slate-600 block">Sign Up With Email</span>
                
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your email address"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Choose a strong password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#003566] hover:bg-[#002240] text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </form>
              </div>

              <div className="pt-4 text-xs text-slate-500 space-y-1">
                <p>By signing up, you accept our <a href="#terms" className="text-[#003566] underline font-semibold">Terms and Conditions</a>.</p>
                <p>
                  <button onClick={() => setSubTab("login")} className="text-[#003566] font-bold hover:underline">
                    Log In
                  </button>{" "}
                  if you already have an account.
                </p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* VACANCY DETAIL VIEW (Interactive overlay/side drawer) */}
      {/* ------------------------------------------------------------- */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-[#003566] text-white p-6 md:p-8 flex justify-between items-start shrink-0">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono bg-[#002b4d] text-[#93c5fd] font-bold px-2.5 py-1 rounded">
                  {selectedJob.category} POSITION
                </span>
                <h3 className="text-xl md:text-2xl font-bold font-serif leading-tight">{selectedJob.title}</h3>
                <p className="text-xs text-slate-200 font-sans">
                  {selectedJob.department} • Reference Number: <strong>{selectedJob.referenceNumber || selectedJob.id}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-white/80 hover:text-white font-sans text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-sm leading-relaxed">
              
              {/* Summary Metadata Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Workplace Type</span>
                  <span className="font-semibold text-slate-700 capitalize">{selectedJob.workplaceType || "Onsite"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Province</span>
                  <span className="font-semibold text-slate-700">{selectedJob.province || "Gauteng"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Town / City</span>
                  <span className="font-semibold text-slate-700">{selectedJob.townCity || "Pretoria"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Closing Date</span>
                  <span className="font-semibold text-slate-700 font-mono text-xs">{selectedJob.dateClosing || "2026/07/24"}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Role Description</h4>
                <p className="text-slate-600 font-sans text-xs">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Requirements & Qualifications</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 font-sans text-xs">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Footer Terms */}
              <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-normal font-sans">
                The HSRC is an equal opportunity employer and committed to the principles of Employment Equity. High-caliber scientists and academic administrators are strongly encouraged to submit their CVs.
              </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setApplyingJob(selectedJob);
                  setSelectedJob(null);
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                Apply for this Position
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* JOB APPLICATION SUBMISSION FORM MODAL */}
      {/* ------------------------------------------------------------- */}
      {applyingJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="bg-[#1e4e79] text-white p-6 flex justify-between items-start shrink-0">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-wider bg-slate-900/40 text-emerald-300 font-bold px-2 py-0.5 rounded">
                  Official Application Portal
                </span>
                <h3 className="text-lg font-bold font-serif mt-1">Submit Application</h3>
                <p className="text-xs text-slate-200 font-sans">Applying for: <strong>{applyingJob.title}</strong></p>
              </div>
              <button 
                onClick={() => setApplyingJob(null)}
                className="text-white/80 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {successMessage ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-emerald-800 text-sm">Submission Completed!</h4>
                  <p className="text-xs text-emerald-700 leading-normal">{successMessage}</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-1.5 text-xs text-slate-600">
                    <p className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#003566]" />
                      Dynamic CV Parsing Powered by Gemini AI
                    </p>
                    <p>
                      Simply paste your academic CV or biography below. The back-office Recruitment OS will automatically parse your publication lists, h-index, grants history, and educational background to streamline committee review.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Sibongile Nkosi"
                        value={applyName}
                        onChange={(e) => setApplyName(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="s.nkosi@hsrc.ac.za"
                        value={applyEmail}
                        onChange={(e) => setApplyEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+27 (0) 72 123 4567"
                        value={applyPhone}
                        onChange={(e) => setApplyPhone(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ORCID iD</label>
                      <input
                        type="text"
                        placeholder="0000-0002-1234-5678"
                        value={applyOrcid}
                        onChange={(e) => setApplyOrcid(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Research Intent or Cover Letter</label>
                    <textarea
                      rows={2}
                      placeholder="Fulfill key scientific goals, collaborative capabilities, or stakeholder relations interests..."
                      value={applyProposal}
                      onChange={(e) => setApplyProposal(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                      <span>Academic CV / Bio Text *</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">Accepts plain text</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Paste your CV details: Publications, Education history, Grants, H-index, and core competencies..."
                      value={applyCVText}
                      onChange={(e) => setApplyCVText(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-900 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                {!successMessage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setApplyingJob(null)}
                      className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApp}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider disabled:bg-slate-400 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {submittingApp ? (
                        <>
                          <span>⏳ Processing & Parsing...</span>
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-center py-6 px-4 text-xs shrink-0 border-t border-slate-800">
        <p>© The Human Sciences Research Council (HSRC). All rights reserved.</p>
        <p className="text-[10px] text-slate-500 mt-1">Gauteng Head Office: 134 Pretorius Street, Pretoria, South Africa</p>
      </footer>

    </div>
  );
}
