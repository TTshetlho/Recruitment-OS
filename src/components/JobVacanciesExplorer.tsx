import React, { useState, useMemo } from "react";
import { JobOpening } from "../types";
import { 
  Search, 
  MapPin, 
  Building2, 
  Calendar, 
  Award, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Tag, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { Badge } from "./design-system/Badge";
import { Button } from "./design-system/Button";
import { Input, Select } from "./design-system/Input";
import { Card } from "./design-system/Card";
import { Modal } from "./design-system/Modal";

interface JobVacanciesExplorerProps {
  jobs: JobOpening[];
  onApplyForJob: (job: JobOpening) => void;
  onOpenPostJob?: () => void;
}

export const JobVacanciesExplorer: React.FC<JobVacanciesExplorerProps> = ({
  jobs,
  onApplyForJob,
  onOpenPostJob,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvince, setSelectedProvince] = useState("All");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All");
  const [activeJobModal, setActiveJobModal] = useState<JobOpening | null>(null);

  // Extract unique categories & provinces from active jobs
  const categories = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.category) set.add(j.category);
    });
    return ["All", ...Array.from(set)];
  }, [jobs]);

  const provinces = [
    "All",
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.referenceNumber?.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "All" ||
        job.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesProv =
        selectedProvince === "All" ||
        job.province?.toLowerCase() === selectedProvince.toLowerCase();

      const matchesWork =
        selectedWorkplace === "All" ||
        job.workplaceType?.toLowerCase() === selectedWorkplace.toLowerCase();

      return matchesSearch && matchesCat && matchesProv && matchesWork;
    });
  }, [jobs, searchTerm, selectedCategory, selectedProvince, selectedWorkplace]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Panel (12-Column Responsive Layout) */}
      <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Main Keyword Search (5 columns) */}
          <div className="md:col-span-5">
            <Input
              label="Position Title or Keyword"
              placeholder="e.g. Research Specialist, Data Scientist, Postdoc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Category / Division Filter (3 columns) */}
          <div className="md:col-span-3">
            <Select
              label="Research Division / Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categories.map((cat) => ({
                value: cat,
                label: cat === "All" ? "All Categories" : cat,
              }))}
            />
          </div>

          {/* Province Filter (2 columns) */}
          <div className="md:col-span-2">
            <Select
              label="Province / Region"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              options={provinces.map((prov) => ({
                value: prov,
                label: prov === "All" ? "All Provinces" : prov,
              }))}
            />
          </div>

          {/* Workplace Filter (2 columns) */}
          <div className="md:col-span-2">
            <Select
              label="Workplace Mode"
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              options={[
                { value: "All", label: "All Modes" },
                { value: "onsite", label: "On-site" },
                { value: "hybrid", label: "Hybrid" },
                { value: "remote", label: "Remote" },
              ]}
            />
          </div>
        </div>

        {/* Quick Filter Tag Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Active Filter Count:</span>
            <span className="font-bold text-[#003366]">
              {filteredJobs.length} {filteredJobs.length === 1 ? "opening" : "openings"} available
            </span>
          </div>

          {(searchTerm || selectedCategory !== "All" || selectedProvince !== "All" || selectedWorkplace !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedProvince("All");
                setSelectedWorkplace("All");
              }}
              className="text-[#008080] hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Vacancy Cards 12-Column Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="text-center py-12 px-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching vacancies found</h3>
            <p className="text-xs text-slate-500">
              We couldn't find any job openings matching your current search criteria. Try modifying your filter
              parameters.
            </p>
            <div className="pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedProvince("All");
                  setSelectedWorkplace("All");
                }}
              >
                Clear Search Filters
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#003366]/30 transition-all duration-150 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Reference Tag & Workplace Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#003366] bg-[#003366]/10 px-2.5 py-0.5 rounded border border-[#003366]/20">
                    {job.referenceNumber || "HSRC-VAC"}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {job.workplaceType ? job.workplaceType.toUpperCase() : "HYBRID"}
                  </Badge>
                </div>

                {/* Job Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#003366] transition-colors leading-snug line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.department}</span>
                  </p>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Meta details */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.townCity ? `${job.townCity}, ${job.province}` : job.province || "Gauteng, RSA"}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Closes: {job.dateClosing || "2026/09/15"}
                    </span>
                  </div>

                  {job.grantCode && (
                    <div className="flex items-center gap-1 text-[#008080] text-[11px] font-mono">
                      <Award className="w-3 h-3 text-[#00A8B5]" />
                      Grant Ref: {job.grantCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveJobModal(job)}
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApplyForJob(job)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Job Specifications Modal */}
      {activeJobModal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveJobModal(null)}
          title={activeJobModal.title}
          subtitle={`Reference: ${activeJobModal.referenceNumber || "HSRC-VAC"} • Department: ${activeJobModal.department}`}
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setActiveJobModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const jobToApply = activeJobModal;
                  setActiveJobModal(null);
                  onApplyForJob(jobToApply);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Apply for this Position
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-sm">
            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-[8px] border border-slate-200">
              <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded border border-slate-200 text-slate-700">
                Location: {activeJobModal.townCity ? `${activeJobModal.townCity}, ${activeJobModal.province}` : activeJobModal.province}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded border border-slate-200 text-slate-700">
                Workplace: {activeJobModal.workplaceType?.toUpperCase() || "HYBRID"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded border border-slate-200 text-slate-700">
                Category: {activeJobModal.category || "Research"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 rounded border border-amber-200 text-amber-900">
                Closing Date: {activeJobModal.dateClosing || "2026/09/15"}
              </span>
            </div>

            {/* Position Overview */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] mb-2">
                Position Summary & Research Mandate
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-xs">
                {activeJobModal.description}
              </p>
            </div>

            {/* Minimum Requirements */}
            {activeJobModal.requirements && activeJobModal.requirements.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#003366] mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Key Qualifications & Experience Requirements
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-[8px] border border-slate-200">
                  {activeJobModal.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#003366] mt-1.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
