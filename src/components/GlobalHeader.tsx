import React, { useState, useRef, useEffect } from "react";
import { 
  Building2, 
  Bell, 
  User, 
  Briefcase, 
  FileText, 
  LayoutGrid, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  Search, 
  Sliders, 
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";

export type PortalTab = 
  | "vacancies" 
  | "dashboard" 
  | "apply" 
  | "post_job" 
  | "design_system";

interface GlobalHeaderProps {
  activeTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  unreadNotificationsCount?: number;
  userRole: "applicant" | "recruiter";
  onToggleRole: () => void;
  onOpenPostJob?: () => void;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  activeTab,
  onTabChange,
  unreadNotificationsCount = 3,
  userRole,
  onToggleRole,
  onOpenPostJob,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    {
      id: "n1",
      title: "Application Status Updated",
      desc: "Senior Research Specialist: Shortlisted for Committee Review",
      time: "10 mins ago",
      type: "shortlisted",
    },
    {
      id: "n2",
      title: "New Vacancy Posted",
      desc: "Lead Data Scientist (Human & Social Capabilities, Pretoria)",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: "n3",
      title: "Document Verification",
      desc: "ORCID synchronization completed for Dr. Nomsa Khumalo",
      time: "1 day ago",
      type: "applied",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#003366] text-white border-b border-[#002244] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Organizational Branding */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange("vacancies")}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-[8px] bg-white flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#003366] rounded-[4px] flex flex-col items-center justify-center text-white font-bold text-[10px] leading-tight">
                  <span className="text-[#00A8B5] font-black">HSRC</span>
                  <span className="text-[7px] tracking-tighter text-slate-300">RECRUIT</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  HSRC Recruitment Portal
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#00A8B5]/20 text-[#00A8B5] border border-[#00A8B5]/40">
                    Official
                  </span>
                </h1>
                <p className="text-xs text-slate-300">Human Sciences Research Council</p>
              </div>
            </button>

            {/* Primary Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/10">
              <button
                onClick={() => onTabChange("vacancies")}
                className={`px-3.5 py-2 text-sm font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "vacancies"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#00A8B5]" />
                Job Vacancies
              </button>

              <button
                onClick={() => onTabChange("dashboard")}
                className={`px-3.5 py-2 text-sm font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "dashboard"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4 text-[#00A8B5]" />
                Application Table
              </button>

              <button
                onClick={() => onTabChange("apply")}
                className={`px-3.5 py-2 text-sm font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "apply"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />
                Apply Flow (Step 1-3)
              </button>

              <button
                onClick={() => onTabChange("design_system")}
                className={`px-3.5 py-2 text-sm font-medium rounded-[8px] transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "design_system"
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Sliders className="w-4 h-4 text-[#00A8B5]" />
                Design Tokens & Specs
              </button>
            </nav>
          </div>

          {/* Right Utility & Profile Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Post Position CTA for HR mode */}
            {onOpenPostJob && (
              <Button
                variant="secondary"
                size="sm"
                className="hidden lg:inline-flex bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={onOpenPostJob}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#00A8B5]" />}
              >
                Post New Job
              </Button>
            )}

            {/* Notification Badge with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-[8px] text-slate-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#003366]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#1A1A1A] rounded-[8px] shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#003366]">Recruitment Notifications</h4>
                      <p className="text-xs text-slate-500">Pipeline updates & application alerts</p>
                    </div>
                    <span className="text-xs font-semibold text-[#008080] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {notifications.length} New
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onTabChange("dashboard");
                      }}
                      className="text-xs font-semibold text-[#003366] hover:underline cursor-pointer"
                    >
                      View all candidate activity →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-[8px] hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#00A8B5] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/20">
                  {userRole === "recruiter" ? "HR" : "NK"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-white leading-tight">
                    {userRole === "recruiter" ? "HSRC Talent Panel" : "Dr. Nomsa Khumalo"}
                  </p>
                  <p className="text-[10px] text-slate-300 capitalize">
                    {userRole === "recruiter" ? "Talent Acquisition" : "Applicant"}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />
              </button>

              {/* Profile Menu Popover */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-[#1A1A1A] rounded-[8px] shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-bold text-[#003366]">
                      {userRole === "recruiter" ? "Talent Acquisition Officer" : "Dr. Nomsa Khumalo"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {userRole === "recruiter" ? "hr-recruitment@hsrc.ac.za" : "nkhumalo.research@gmail.com"}
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified RSA ID & ORCID
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        onToggleRole();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-[6px] flex items-center justify-between cursor-pointer"
                    >
                      <span>Active Role:</span>
                      <span className="font-bold text-[#003366] bg-slate-200/60 px-2 py-0.5 rounded text-[11px]">
                        {userRole === "recruiter" ? "Recruiter / HR" : "Candidate"} (Switch)
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("dashboard");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-[6px] flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Track My Applications
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("design_system");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-[6px] flex items-center gap-2 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      Design System & Tokens
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
