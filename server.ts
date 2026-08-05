import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Helper to load/save mock DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { jobs: [], candidates: [], evaluations: [], referees: [] };
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading db.json, returning empty structure:", error);
    return { jobs: [], candidates: [], evaluations: [], referees: [] };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
}

// Lazy load Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check if Gemini is configured
app.get("/api/gemini/status", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "";
  res.json({ configured: isConfigured });
});

// GET /api/jobs - List all jobs
app.get("/api/jobs", (req, res) => {
  const db = readDb();
  res.json(db.jobs || []);
});

// POST /api/jobs - Create a new job
app.post("/api/jobs", (req, res) => {
  const { title, department, grantCode, description, requirements, workplaceType, province, townCity, category, referenceNumber, dateClosing } = req.body;
  if (!title || !department) {
    return res.status(400).json({ error: "Title and Department are required." });
  }
  const db = readDb();
  const newJob = {
    id: `job-${Date.now()}`,
    title,
    department,
    grantCode: grantCode || "",
    description: description || "",
    requirements: Array.isArray(requirements) ? requirements : [],
    status: "active" as const,
    datePosted: new Date().toISOString().split("T")[0],
    workplaceType: workplaceType || "onsite",
    province: province || "Gauteng",
    townCity: townCity || "Pretoria",
    category: category || "Research",
    referenceNumber: referenceNumber || `HSRC-${Math.floor(Math.random() * 9000 + 1000)}`,
    dateClosing: dateClosing || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0].replace(/-/g, "/"),
  };
  db.jobs.push(newJob);
  writeDb(db);
  res.status(201).json(newJob);
});

// GET /api/candidates - List candidates
app.get("/api/candidates", (req, res) => {
  const db = readDb();
  res.json(db.candidates || []);
});

// POST /api/candidates - Create candidate
app.post("/api/candidates", (req, res) => {
  const { jobId, name, email, phone, orcid, scholarLink, hIndex, researchProposal, cvTextRaw } = req.body;
  if (!jobId || !name || !email) {
    return res.status(400).json({ error: "jobId, name, and email are required." });
  }
  const db = readDb();
  const newCandidate = {
    id: `cand-${Date.now()}`,
    jobId,
    name,
    email,
    phone: phone || "",
    orcid: orcid || "",
    scholarLink: scholarLink || "",
    hIndex: hIndex ? parseInt(hIndex) : 0,
    stage: "applied" as const,
    dateApplied: new Date().toISOString().split("T")[0],
    researchProposal: researchProposal || "",
    publications: [],
    cvTextRaw: cvTextRaw || "",
    cvParsedData: undefined,
  };
  db.candidates.push(newCandidate);
  writeDb(db);
  res.status(201).json(newCandidate);
});

// PUT /api/candidates/:id/stage - Update candidate pipeline stage
app.put("/api/candidates/:id/stage", (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;
  if (!["applied", "committee_review", "seminar", "offer"].includes(stage)) {
    return res.status(400).json({ error: "Invalid stage value." });
  }
  const db = readDb();
  const candidate = db.candidates.find((c: any) => c.id === id);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  candidate.stage = stage;
  writeDb(db);
  res.json(candidate);
});

// PUT /api/candidates/:id/scholar - Update custom fields (orcid, scholarLink, hIndex, publications)
app.put("/api/candidates/:id/academic-fields", (req, res) => {
  const { id } = req.params;
  const { orcid, scholarLink, hIndex, publications } = req.body;
  const db = readDb();
  const candidate = db.candidates.find((c: any) => c.id === id);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  if (orcid !== undefined) candidate.orcid = orcid;
  if (scholarLink !== undefined) candidate.scholarLink = scholarLink;
  if (hIndex !== undefined) candidate.hIndex = parseInt(hIndex) || 0;
  if (Array.isArray(publications)) candidate.publications = publications;
  writeDb(db);
  res.json(candidate);
});

// POST /api/candidates/parse-cv - Use Gemini 3.5-flash to extract structural academic metadata
app.post("/api/candidates/parse-cv", async (req, res) => {
  const { cvText } = req.body;
  if (!cvText || cvText.trim() === "") {
    return res.status(400).json({ error: "CV Text is required." });
  }

  try {
    const ai = getGeminiClient();
    const schema = {
      type: Type.OBJECT,
      properties: {
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              institution: { type: Type.STRING },
              year: { type: Type.INTEGER },
            },
            required: ["degree", "institution", "year"],
          },
        },
        publications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              journal: { type: Type.STRING },
              year: { type: Type.INTEGER },
              citations: { type: Type.INTEGER },
            },
            required: ["title", "journal", "year", "citations"],
          },
        },
        grantHistory: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              fundingAgency: { type: Type.STRING },
              amount: { type: Type.STRING },
              year: { type: Type.INTEGER },
            },
            required: ["title", "fundingAgency", "amount", "year"],
          },
        },
        hIndex: { type: Type.INTEGER },
        extractedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        summary: { type: Type.STRING },
      },
      required: ["education", "publications", "grantHistory", "extractedKeywords", "summary"],
    };

    const prompt = `You are an expert academic CV parsing intelligence. Extract academic credentials, publications, education, and research grant history from this raw CV text. Be extremely structured and return a detailed response matching the specified JSON schema. If citations or H-index are not specified, estimate or extract reasonably.

CV RAW TEXT:
${cvText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const parsedString = response.text ? response.text.trim() : "";
    const parsedData = JSON.parse(parsedString);
    res.json({ success: true, parsedData });
  } catch (err: any) {
    console.error("Gemini CV parsing error:", err.message);

    // Fallback: simulated parsed data so user experiences the core app even if API key is missing
    const simulatedData = {
      education: [
        { degree: "Ph.D. in Biological Informatics", institution: "University of Toronto", year: 2022 },
        { degree: "M.S. in Biotechnology", institution: "McGill University", year: 2018 }
      ],
      publications: [
        { title: "Deep learning models for structural bioinformatics prediction", journal: "Bioinformatics Journal", year: 2023, citations: 28 },
        { title: "Next-gen sequence processing in large cellular networks", journal: "Nucleic Acids Research", year: 2021, citations: 41 }
      ],
      grantHistory: [
        { title: "Young Investigator Genome Grant", fundingAgency: "CIHR Canada", amount: "$150,000", year: 2024 }
      ],
      hIndex: 7,
      extractedKeywords: ["Deep learning", "Structural bioinformatics", "Genome sequencing", "CIHR Fellowship"],
      summary: "[DEMO / SIMULATED PARSE] Highly accomplished researcher with solid publications in Bioinformatics and Nucleic Acids journals. Specializes in Deep Learning models applied to genome alignment."
    };

    res.json({
      success: false,
      error: err.message,
      parsedData: simulatedData,
      isFallback: true
    });
  }
});

// GET /api/evaluations - List evaluations for candidate
app.get("/api/evaluations", (req, res) => {
  const { candidateId } = req.query;
  const db = readDb();
  let evals = db.evaluations || [];
  if (candidateId) {
    evals = evals.filter((e: any) => e.candidateId === candidateId);
  }
  res.json(evals);
});

// POST /api/evaluations - Create an evaluation, optionally call Gemini to generate a blinded comments version
app.post("/api/evaluations", async (req, res) => {
  const { candidateId, reviewerName, reviewerRole, scoreScientificMerit, scoreFundingPotential, scoreTeachingAbility, comments } = req.body;
  if (!candidateId || !reviewerName || !comments) {
    return res.status(400).json({ error: "candidateId, reviewerName, and comments are required." });
  }

  const db = readDb();
  const candidate = db.candidates.find((c: any) => c.id === candidateId);
  const candidateName = candidate ? candidate.name : "the candidate";

  let blindedComments = comments;

  try {
    const ai = getGeminiClient();
    const prompt = `You are an academic compliance compliance bot. Your job is to redact/blind peer-review comments.
Take the following comment written by an evaluator about the candidate "${candidateName}" and return a redacted version that:
1. Replaces the candidate's name or specific institution names with "the candidate" or generic academic terms.
2. Replaces gendered pronouns (he/she/him/her/his) with neutral phrasing ("they", "the candidate's", "the applicant").
3. Removes the evaluator's own name, or specific names of laboratories if they reveal PII.
4. Focuses strictly on scientific merits, potential, methods, and teachings.
Do NOT change the overall rating sentiment or the technical critique. Return ONLY the redacted/blinded text as a plain paragraph.

ORIGINAL EVALUATION COMMENTS:
"${comments}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    if (response.text) {
      blindedComments = response.text.trim();
    }
  } catch (err: any) {
    console.warn("Blinded comment generation skipped/failed:", err.message);
    // Simple fallback masking
    blindedComments = comments
      .replace(new RegExp(candidateName, "gi"), "the candidate")
      .replace(/\b(she|he)\b/gi, "the candidate")
      .replace(/\b(her|his)\b/gi, "the candidate's");
  }

  const newEval = {
    id: `eval-${Date.now()}`,
    candidateId,
    reviewerName,
    reviewerRole: reviewerRole || "reviewer",
    scoreScientificMerit: parseInt(scoreScientificMerit) || 3,
    scoreFundingPotential: parseInt(scoreFundingPotential) || 3,
    scoreTeachingAbility: parseInt(scoreTeachingAbility) || 3,
    comments,
    blindedComments,
    dateSubmitted: new Date().toISOString().split("T")[0],
  };

  db.evaluations.push(newEval);
  writeDb(db);
  res.status(201).json(newEval);
});

// GET /api/referees - List referees
app.get("/api/referees", (req, res) => {
  const { candidateId } = req.query;
  const db = readDb();
  let refs = db.referees || [];
  if (candidateId) {
    refs = refs.filter((r: any) => r.candidateId === candidateId);
  }
  res.json(refs);
});

// POST /api/referees - Add referee to candidate
app.post("/api/referees", (req, res) => {
  const { candidateId, name, email, institution } = req.body;
  if (!candidateId || !name || !email) {
    return res.status(400).json({ error: "candidateId, name, and email are required." });
  }
  const db = readDb();
  const token = `tok_${Math.random().toString(36).substring(2, 11)}`;
  const newRef = {
    id: `ref-${Date.now()}`,
    candidateId,
    name,
    email,
    institution: institution || "",
    status: "pending" as const,
    token,
  };
  db.referees.push(newRef);
  writeDb(db);
  res.status(201).json(newRef);
});

// POST /api/referees/upload/:token - Upload letter using referee token
app.post("/api/referees/upload/:token", (req, res) => {
  const { token } = req.params;
  const { letterContent } = req.body;
  if (!letterContent || letterContent.trim() === "") {
    return res.status(400).json({ error: "Letter content is required." });
  }
  const db = readDb();
  const referee = db.referees.find((r: any) => r.token === token);
  if (!referee) {
    return res.status(404).json({ error: "Referee token not found." });
  }
  referee.status = "submitted";
  referee.letterContent = letterContent;
  referee.dateUploaded = new Date().toISOString().split("T")[0];

  writeDb(db);
  res.json({ success: true, referee });
});

// Delete a candidate
app.delete("/api/candidates/:id", (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.candidates = db.candidates.filter((c: any) => c.id !== id);
  db.evaluations = db.evaluations.filter((e: any) => e.candidateId !== id);
  db.referees = db.referees.filter((r: any) => r.candidateId !== id);
  writeDb(db);
  res.json({ success: true });
});

// Vite middleware & static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Academic Recruitment OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
