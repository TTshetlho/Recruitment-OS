import React, { useState } from "react";
import { JobOpening } from "../types";
import { PlusCircle, Building, Award, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "./design-system/Button";
import { Input, Textarea, Select } from "./design-system/Input";
import { Modal } from "./design-system/Modal";

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (newJob: any) => Promise<void>;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Human and Social Capabilities");
  const [referenceNumber, setReferenceNumber] = useState(`HSRC-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [category, setCategory] = useState("Research");
  const [workplaceType, setWorkplaceType] = useState<"onsite" | "hybrid" | "remote">("hybrid");
  const [province, setProvince] = useState("Gauteng");
  const [townCity, setTownCity] = useState("Pretoria");
  const [grantCode, setGrantCode] = useState("");
  const [description, setDescription] = useState("");
  const [requirementsInput, setRequirementsInput] = useState("");
  const [dateClosing, setDateClosing] = useState("2026/09/30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a job title.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const requirements = requirementsInput
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      await onJobCreated({
        title,
        department,
        referenceNumber,
        category,
        workplaceType,
        province,
        townCity,
        grantCode,
        description,
        requirements,
        dateClosing,
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create job posting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post New Vacancy Opening"
      subtitle="Publish an active recruitment vacancy to the official HSRC Careers Portal."
      maxWidth="2xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Publish Vacancy
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-[8px] text-xs font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Position Title"
            isRequired
            placeholder="e.g. Chief Research Specialist: Inclusive Economies"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Reference Number"
            isRequired
            placeholder="e.g. HSRC-REC-2026-08"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Research Division / Directorate"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={[
              { value: "Human and Social Capabilities", label: "Human and Social Capabilities (HSC)" },
              { value: "Inclusive Economic Development", label: "Inclusive Economic Development (IED)" },
              { value: "Developmental, Capable and Ethical State", label: "Developmental, Capable and Ethical State (DCES)" },
              { value: "CeSTII (Science & Tech)", label: "CeSTII (Science & Tech)" },
              { value: "Africa Institute of South Africa", label: "Africa Institute of South Africa (AISA)" },
              { value: "Shared Services & Governance", label: "Shared Services & Governance" },
            ]}
          />

          <Select
            label="Job Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "Research", label: "Research" },
              { value: "Management", label: "Management" },
              { value: "Executive", label: "Executive" },
              { value: "IT", label: "IT & Digital" },
              { value: "Finance", label: "Finance & Supply Chain" },
              { value: "HR", label: "Human Resources" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Workplace Mode"
            value={workplaceType}
            onChange={(e) => setWorkplaceType(e.target.value as any)}
            options={[
              { value: "hybrid", label: "Hybrid" },
              { value: "onsite", label: "On-site" },
              { value: "remote", label: "Remote" },
            ]}
          />

          <Select
            label="Province"
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
            label="Closing Date"
            placeholder="YYYY/MM/DD"
            value={dateClosing}
            onChange={(e) => setDateClosing(e.target.value)}
          />
        </div>

        <Input
          label="Grant Funding Code (Optional)"
          placeholder="e.g. NRF-HSRC-2026-GR99"
          value={grantCode}
          onChange={(e) => setGrantCode(e.target.value)}
        />

        <Textarea
          label="Job Description & Scope of Work"
          rows={3}
          placeholder="Provide background, core responsibilities, and research expectations..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label="Minimum Requirements (One per line)"
          rows={3}
          placeholder="Ph.D. in Social Sciences or Economics&#10;Minimum 5 first-author peer-reviewed publications&#10;Proven track record in policy advisory and grant leadership"
          value={requirementsInput}
          onChange={(e) => setRequirementsInput(e.target.value)}
        />
      </form>
    </Modal>
  );
};
