import React, { useState } from "react";
import { JobOpening } from "../types";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  Award,
  Globe
} from "lucide-react";
import { Button } from "./design-system/Button";
import { Input, Textarea, Select } from "./design-system/Input";
import { Card, CardHeader } from "./design-system/Card";
import { Badge } from "./design-system/Badge";

interface JobApplicationStepFormProps {
  jobs: JobOpening[];
  preselectedJobId?: string;
  onSuccessSubmit: (candData: any) => Promise<boolean>;
  onCancel: () => void;
}

export const JobApplicationStepForm: React.FC<JobApplicationStepFormProps> = ({
  jobs,
  preselectedJobId,
  onSuccessSubmit,
  onCancel,
}) => {
  // Active Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [targetJobId, setTargetJobId] = useState<string>(preselectedJobId || (jobs[0]?.id || ""));
  
  // Step 1: Personal & Contact
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("Gauteng");
  const [city, setCity] = useState("Pretoria");

  // Step 2: Academic & Research Profile
  const [highestDegree, setHighestDegree] = useState("PhD / Doctorate");
  const [orcid, setOrcid] = useState("");
  const [scholarLink, setScholarLink] = useState("");
  const [researchProposal, setResearchProposal] = useState("");

  // Step 3: CV & Supporting Documentation
  const [cvTextRaw, setCvTextRaw] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParsedNotice, setAiParsedNotice] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);

  const selectedJob = jobs.find((j) => j.id === targetJobId) || jobs[0];

  // Validation function per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!fullName.trim()) newErrors.fullName = "Full legal name is required as per RSA ID / Passport.";
      if (!email.trim()) {
        newErrors.email = "Valid email address is required for official recruitment correspondence.";
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        newErrors.email = "Please provide a valid email format (e.g. name@domain.com).";
      }
      if (!phone.trim()) newErrors.phone = "Contact telephone/mobile number is required.";
      if (!targetJobId) newErrors.targetJobId = "Please select an active vacancy opening.";
    }

    if (step === 2) {
      if (!highestDegree) newErrors.highestDegree = "Please indicate your highest academic qualification.";
      if (orcid.trim() && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid.trim())) {
        newErrors.orcid = "ORCID should follow format 0000-0002-1825-0097.";
      }
      if (!researchProposal.trim() || researchProposal.trim().length < 40) {
        newErrors.researchProposal = "Please provide a brief statement of research capability (min. 40 characters).";
      }
    }

    if (step === 3) {
      if (!cvTextRaw.trim()) {
        newErrors.cvTextRaw = "Please paste or upload your CV text for academic scoring.";
      }
      if (!termsAccepted) {
        newErrors.termsAccepted = "You must confirm the truthfulness of your submission and POPIA consent.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  // Fast sample CV loader for candidate convenience
  const handleLoadSampleCV = () => {
    const sample = `Dr. Nomsa Khumalo, Ph.D.
Senior Research Scientist in Human & Social Development
ORCID: 0000-0002-9841-3321 | Email: n.khumalo@uct.ac.za

EDUCATION:
- Ph.D. in Development Economics, University of Cape Town (2020)
- M.Sc. in Applied Statistics, University of the Witwatersrand (2016)

PUBLICATIONS:
1. Khumalo, N., & Ndlovu, B. (2024). "Evaluating Youth Employment Interventions in Post-Apartheid South Africa." Journal of Development Studies, 45 citations.
2. Khumalo, N. (2023). "Digital Financial Inclusion in Rural Municipalities." African Development Review, 28 citations.
3. Khumalo, N., et al. (2022). "Public Health Policy and Social Determinants in Gauteng." SA Medical Journal, 34 citations.

GRANT HISTORY:
- NRF Thuthuka Grant (R450,000) - Principal Investigator (2022-2024)
- HSRC Collaborative Seed Fund (R180,000) - Co-Investigator (2021)`;

    setCvTextRaw(sample);
    setAiParsedNotice("Sample Academic CV loaded. Ready for Gemini automatic structuring.");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const payload = {
        jobId: targetJobId,
        name: fullName,
        email: email,
        phone: phone,
        orcid: orcid,
        scholarLink: scholarLink,
        researchProposal: researchProposal,
        cvTextRaw: cvTextRaw,
      };

      const success = await onSuccessSubmit(payload);
      if (success) {
        setSubmissionCompleted(true);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionCompleted) {
    return (
      <Card className="max-w-2xl mx-auto text-center py-12 px-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <Badge variant="applied" className="mb-3">
          Application Received & Registered
        </Badge>
        <h3 className="text-2xl font-bold text-[#003366] tracking-tight">
          Application Submitted Successfully
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
          Thank you, <strong>{fullName}</strong>. Your dossier for{" "}
          <strong>{selectedJob?.title || "the selected vacancy"}</strong> has been registered with the HSRC
          Recruitment System.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-4 text-xs text-left text-slate-700 max-w-md mx-auto my-6 space-y-1.5">
          <p className="font-semibold text-[#003366] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Application Reference: HSRC-APP-{Date.now().toString().slice(-6)}
          </p>
          <p className="text-slate-500">
            A confirmation has been logged for <span className="font-semibold text-slate-800">{email}</span>.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Return to Vacancy Explorer
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setSubmissionCompleted(false);
              setCurrentStep(1);
              setFullName("");
              setEmail("");
              setPhone("");
              setOrcid("");
              setResearchProposal("");
              setCvTextRaw("");
              setTermsAccepted(false);
            }}
          >
            Submit Another Application
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 3-Step Progress Header */}
      <div className="bg-white rounded-[8px] border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: "Step 1", title: "Personal Details" },
            { step: 2, label: "Step 2", title: "Academic Profile" },
            { step: 3, label: "Step 3", title: "CV & Confirmation" },
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex-1 flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center font-bold text-xs transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-[#003366] text-white ring-4 ring-[#003366]/15 shadow-xs"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isCurrent ? "text-[#008080]" : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-[#003366]" : "text-slate-600"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > idx + 1 ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Vacancy Banner Card */}
      <div className="bg-[#003366]/5 border border-[#003366]/15 rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#003366] text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#00A8B5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#008080] uppercase tracking-wider">
                Applying For Position:
              </span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                {selectedJob?.referenceNumber || "HSRC-VAC"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#003366]">{selectedJob?.title}</h4>
          </div>
        </div>

        {jobs.length > 1 && (
          <div className="sm:w-64">
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-[8px] border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* STEP 1: Personal & Contact Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader
            title="Step 1: Personal & Contact Information"
            subtitle="Please provide your legal identity and verified contact channels."
          />
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                isRequired
                placeholder="e.g. Dr. Nomsa Khumalo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="National ID or Passport Number"
                placeholder="e.g. 890412 5182 084"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                helperText="Required for South African Employment Equity reporting"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                isRequired
                type="email"
                placeholder="e.g. nkhumalo@example.ac.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Contact Telephone / Mobile"
                isRequired
                placeholder="e.g. +27 82 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Province of Residence"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                options={[
                  { value: "Gauteng", label: "Gauteng" },
                  { value: "Western Cape", label: "Western Cape" },
                  { value: "KwaZulu-Natal", label: "KwaZulu-Natal" },
                  { value: "Eastern Cape", label: "Eastern Cape" },
                  { value: "Free State", label: "Free State" },
                  { value: "Limpopo", label: "Limpopo" },
                  { value: "Mpumalanga", label: "Mpumalanga" },
                  { value: "North West", label: "North West" },
                  { value: "Northern Cape", label: "Northern Cape" },
                ]}
              />

              <Input
                label="Town / City"
                placeholder="e.g. Pretoria / Cape Town / Durban"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Academic Profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Academic & Research Profile */}
      {currentStep === 2 && (
        <Card>
          <CardHeader
            title="Step 2: Academic & Research Credentials"
            subtitle="Record your scholarly IDs, highest qualification, and statement of research intent."
          />
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Highest Academic Qualification"
                isRequired
                value={highestDegree}
                onChange={(e) => setHighestDegree(e.target.value)}
                error={errors.highestDegree}
                options={[
                  { value: "PhD / Doctorate", label: "PhD / Doctorate (NQF 10)" },
                  { value: "Master's Degree", label: "Master's Degree (NQF 9)" },
                  { value: "Honours / Postgraduate Diploma", label: "Honours / PGDip (NQF 8)" },
                  { value: "Bachelor's Degree", label: "Bachelor's Degree (NQF 7)" },
                  { value: "Other", label: "Other Professional Designation" },
                ]}
              />

              <Input
                label="ORCID iD Identifier"
                placeholder="0000-0002-1825-0097"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
                error={errors.orcid}
                helperText="International scholar registry identifier"
                leftIcon={<Award className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Google Scholar / ResearchGate Profile URL"
              placeholder="https://scholar.google.com/citations?user=..."
              value={scholarLink}
              onChange={(e) => setScholarLink(e.target.value)}
              helperText="Optional URL for citations and bibliometrics"
              leftIcon={<Globe className="w-4 h-4" />}
            />

            <Textarea
              label="Statement of Research Interest & Alignment with HSRC Mandate"
              isRequired
              rows={5}
              placeholder="Describe your research methodology, past academic grants, and direct alignment with human and social sciences..."
              value={researchProposal}
              onChange={(e) => setResearchProposal(e.target.value)}
              error={errors.researchProposal}
              helperText="Minimum 40 characters summarizing your academic contribution."
            />

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Personal Details
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to CV Upload
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: CV Upload & Confirmation */}
      {currentStep === 3 && (
        <Card>
          <CardHeader
            title="Step 3: Curriculum Vitae & Final Submission"
            subtitle="Upload or paste your CV for automatic Gemini parsing, citation verification, and submission."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLoadSampleCV}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />}
              >
                Paste Sample Academic CV
              </Button>
            }
          />
          <div className="space-y-4 pt-2">
            {aiParsedNotice && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-[8px] text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00A8B5] shrink-0" />
                <span>{aiParsedNotice}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Curriculum Vitae (Paste Full Text or Academic Summary) *
              </label>
              <textarea
                rows={8}
                value={cvTextRaw}
                onChange={(e) => setCvTextRaw(e.target.value)}
                placeholder="Paste full text of your CV here (Education, Publications, Grants, Experience)... Our Gemini engine will automatically extract citations, journals, and calculate your bibliometric impact."
                className={`w-full text-xs font-mono p-3 bg-white rounded-[8px] border ${
                  errors.cvTextRaw ? "border-rose-500" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-[#003366] leading-relaxed`}
              />
              {errors.cvTextRaw && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.cvTextRaw}
                </p>
              )}
            </div>

            {/* Application Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[8px] text-xs text-slate-700 space-y-2">
              <h5 className="font-bold text-[#003366] uppercase tracking-wider text-[11px]">
                Submission Confirmation Summary
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-500">Applicant: </span>
                  <span className="font-semibold text-slate-900">{fullName || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email: </span>
                  <span className="font-semibold text-slate-900">{email || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Position: </span>
                  <span className="font-semibold text-slate-900">{selectedJob?.title}</span>
                </div>
                <div>
                  <span className="text-slate-500">Highest Degree: </span>
                  <span className="font-semibold text-slate-900">{highestDegree}</span>
                </div>
              </div>
            </div>

            {/* POPIA & Accuracy Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
                />
                <span className="leading-relaxed">
                  I hereby declare that all information supplied is complete and true. I authorize the Human
                  Sciences Research Council (HSRC) to verify my credentials, ORCID records, and conduct
                  reference checks in compliance with the Protection of Personal Information Act (POPIA).
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium pl-6">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.termsAccepted}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <Button
                variant="ghost"
                onClick={handleBack}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Academic Profile
              </Button>
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleFinalSubmit}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
