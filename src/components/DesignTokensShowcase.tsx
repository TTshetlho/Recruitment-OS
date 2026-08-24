import React, { useState } from "react";
import { 
  Palette, 
  Layers, 
  Type, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  Info, 
  Sparkles,
  MousePointerClick
} from "lucide-react";
import { Button } from "./design-system/Button";
import { Input, Textarea, Select } from "./design-system/Input";
import { Badge } from "./design-system/Badge";
import { Card, CardHeader } from "./design-system/Card";

export const DesignTokensShowcase: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sampleInputText, setSampleInputText] = useState("");
  const [sampleInputError, setSampleInputError] = useState("");

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const colorTokens = [
    {
      name: "Primary Navy",
      hex: "#003366",
      usage: "Headers, primary CTAs, active navigation items",
      sampleClass: "bg-[#003366] text-white",
    },
    {
      name: "Primary Navy Dark",
      hex: "#0A4B83",
      usage: "Hover & focus states for primary elements",
      sampleClass: "bg-[#0A4B83] text-white",
    },
    {
      name: "Secondary Teal",
      hex: "#00A8B5",
      usage: "Highlights, interactive badges, secondary buttons",
      sampleClass: "bg-[#00A8B5] text-white",
    },
    {
      name: "Secondary Teal Dark",
      hex: "#008080",
      usage: "Text labels, active secondary button states",
      sampleClass: "bg-[#008080] text-white",
    },
    {
      name: "Neutral Light Canvas",
      hex: "#F8F9FA",
      usage: "Global background plane",
      sampleClass: "bg-[#F8F9FA] text-[#1A1A1A] border border-slate-300",
    },
    {
      name: "Neutral Card Surface",
      hex: "#FFFFFF",
      usage: "Contained cards and elevated modal surfaces",
      sampleClass: "bg-white text-[#1A1A1A] border border-slate-300",
    },
    {
      name: "Neutral Dark / Charcoal",
      hex: "#1A1A1A",
      usage: "High-contrast WCAG AA body and heading text",
      sampleClass: "bg-[#1A1A1A] text-white",
    },
  ];

  const systemStates = [
    {
      label: "Applied / Shortlisted",
      type: "Green",
      classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
      badgeVariant: "shortlisted" as const,
      desc: "Positive progress in recruitment pipeline",
    },
    {
      label: "Pending / In Review",
      type: "Yellow / Orange",
      classes: "bg-amber-50 text-amber-800 border-amber-200",
      badgeVariant: "in_review" as const,
      desc: "Awaiting committee evaluation or screening",
    },
    {
      label: "Rejected / Urgent",
      type: "Red",
      classes: "bg-rose-50 text-rose-800 border-rose-200",
      badgeVariant: "urgent" as const,
      desc: "Urgent deadlines or unprogressed candidates",
    },
    {
      label: "Draft / Info",
      type: "Blue / Sky",
      classes: "bg-sky-50 text-sky-800 border-sky-200",
      badgeVariant: "info" as const,
      desc: "Draft positions, general notices, or references",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Intro Banner */}
      <div className="bg-[#003366] text-white rounded-[8px] p-6 shadow-xs border border-[#002244]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#00A8B5]/20 text-[#00A8B5] border border-[#00A8B5]/40">
                Design Tokens v2.0
              </span>
              <span className="text-xs text-slate-300">WCAG AA Compliant</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">HSRC Recruitment Portal Design System</h3>
            <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
              Standardized component library and token specifications ensuring complete visual, structural, and
              interaction consistency across all recruitment modules.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Brand & Design Tokens */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Palette className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">1. Brand & Color Tokens</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {colorTokens.map((token, i) => (
            <Card key={i} padded={false} className="overflow-hidden">
              <div className={`h-20 ${token.sampleClass} flex items-center justify-center p-3 font-mono font-bold text-xs`}>
                {token.hex}
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-slate-900">{token.name}</p>
                <p className="text-[11px] text-slate-500">{token.usage}</p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {token.hex}
                  </span>
                  <button
                    onClick={() => handleCopy(token.hex, `hex-${i}`)}
                    className="text-xs text-[#008080] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === `hex-${i}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. System State Badges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Layers className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">2. System State Pills & Tags</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStates.map((st, i) => (
            <Card key={i} className="space-y-3">
              <Badge variant={st.badgeVariant}>
                {st.label}
              </Badge>
              <div>
                <p className="text-xs font-bold text-slate-800">{st.type}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded">
                <code>{`<Badge variant="${st.badgeVariant}">`}{st.label}{`</Badge>`}</code>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Button Component Library */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <MousePointerClick className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">3. Standardized Button Component</h3>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Button */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Primary Button</p>
              <div className="flex flex-col gap-2.5">
                <Button variant="primary" size="md">
                  Submit Application
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#00A8B5]" />}>
                  AI Structure CV
                </Button>
                <Button variant="primary" isLoading size="sm">
                  Submitting
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">Filled #003366 with white text (one main CTA per view).</p>
            </div>

            {/* Secondary Button */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Secondary Button</p>
              <div className="flex flex-col gap-2.5">
                <Button variant="secondary" size="md">
                  View Job Details
                </Button>
                <Button variant="secondary" size="sm">
                  Download Dossier
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">Outlined / teal accent (#00A8B5 / #008080) for complementary actions.</p>
            </div>

            {/* Tertiary / Ghost Button */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tertiary / Ghost Button</p>
              <div className="flex flex-col gap-2.5">
                <Button variant="ghost" size="md">
                  Cancel Application
                </Button>
                <Button variant="ghost" size="sm">
                  Back to Vacancies
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">Text-only for low-priority navigation and dismiss actions.</p>
            </div>
          </div>
        </Card>
      </section>

      {/* 4. Form Inputs & Inline Validation */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Type className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">4. Forms & Input States</h3>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Input */}
            <div className="space-y-2">
              <Input
                label="Full Candidate Name"
                isRequired
                placeholder="e.g. Dr. Nomsa Khumalo"
                helperText="Standard resting & focus state (Navy ring)"
              />
            </div>

            {/* Error Validation State */}
            <div className="space-y-2">
              <Input
                label="Academic Email Address"
                isRequired
                placeholder="invalid-email"
                defaultValue="invalid-format-email"
                error="Please enter a valid institutional email address."
              />
            </div>

            {/* Success State */}
            <div className="space-y-2">
              <Input
                label="ORCID iD Identifier"
                defaultValue="0000-0002-1825-0097"
                success
                helperText="Verified against global ORCID registry"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* 5. Shape & Elevation Specification */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Sliders className="w-5 h-5 text-[#003366]" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">5. Shape & Elevation Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[8px] p-5 border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Standard Card Surface</h4>
            <p className="text-xs text-slate-500 mb-3">8px border-radius (`rounded-[8px]`), subtle 1px border (#E2E8F0).</p>
            <div className="h-10 bg-slate-50 rounded-[8px] border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-mono">
              border-radius: 8px
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-5 border border-slate-200 shadow-md">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Elevated Dropdown / Flyout</h4>
            <p className="text-xs text-slate-500 mb-3">Soft drop-shadow (`shadow-md`), crisp border against canvas.</p>
            <div className="h-10 bg-slate-50 rounded-[8px] border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-mono">
              box-shadow: 0 4px 6px -1px
            </div>
          </div>

          <div className="bg-white rounded-[8px] p-5 border border-slate-200 shadow-xl">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Modal Dialog Surface</h4>
            <p className="text-xs text-slate-500 mb-3">High elevation (`shadow-xl`) over darkened backdrop overlay.</p>
            <div className="h-10 bg-slate-50 rounded-[8px] border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 font-mono">
              box-shadow: 0 20px 25px -5px
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
