import React, { useState } from "react";
import { JobOpening } from "../types";
import { Briefcase, Building, Plus, Award, Calendar, FileText, CheckCircle, Tag } from "lucide-react";

interface JobListProps {
  jobs: JobOpening[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string | null) => void;
  onAddJob: (job: Omit<JobOpening, "id" | "status" | "datePosted">) => Promise<void>;
}

export default function JobList({ jobs, selectedJobId, onSelectJob, onAddJob }: JobListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [grantCode, setGrantCode] = useState("");
  const [description, setDescription] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !department) return;
    setIsSubmitting(true);
    try {
      const requirements = reqInput
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      await onAddJob({
        title,
        department,
        grantCode,
        description,
        requirements,
      });

      // Reset
      setTitle("");
      setDepartment("");
      setGrantCode("");
      setDescription("");
      setReqInput("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold font-display text-slate-800 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-600" />
            Active Job Openings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Academic chairs, grants, and labs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? "Cancel" : "Post Opening"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Position Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Position Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Assistant Professor in Bioinformatics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Research Lab / Department *</label>
              <input
                type="text"
                required
                placeholder="e.g., Computational Biology Lab"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Funding Grant Code</label>
              <input
                type="text"
                placeholder="e.g., NIH-G-2026-09"
                value={grantCode}
                onChange={(e) => setGrantCode(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              placeholder="Provide a summary of the position, lab description, and scope..."
              value={description}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Minimum Requirements (One per line)
            </label>
            <textarea
              placeholder="e.g., Ph.D. in Computational Biology&#10;Minimum 3 first-author publications&#10;Experience with sequence alignment tools"
              value={reqInput}
              rows={3}
              onChange={(e) => setReqInput(e.target.value)}
              className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting ? "Creating..." : "Save Position"}
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        <div
          onClick={() => onSelectJob(null)}
          className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
            selectedJobId === null ? "bg-slate-50/90 border-l-2 border-slate-900" : "hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedJobId === null ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">All Lab Openings</p>
              <p className="text-xs text-slate-500">Show pipeline across all research departments</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
            {jobs.length}
          </span>
        </div>

        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? "bg-slate-50/90 border-l-2 border-slate-900" : "hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-800 font-display hover:text-slate-950 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {job.department}
                    </span>
                    {job.grantCode && (
                      <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold">
                        <Award className="w-3 h-3 text-indigo-500" />
                        {job.grantCode}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {job.datePosted}
                    </span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-100/60 text-xs text-slate-600 space-y-2 animate-fade-in">
                  <p className="leading-relaxed">{job.description}</p>
                  {job.requirements.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-slate-500" /> Requirements:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="leading-relaxed">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
