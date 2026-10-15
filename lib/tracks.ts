import { TRACK_IDS, type Track, type TrackId } from "@/types";

/**
 * Track catalogue. Edit this file to add or update tracks; the UI renders
 * whatever is listed here. Copy deliberately avoids fees, cohort dates and
 * placement claims.
 */
export const TRACKS: Record<TrackId, Track> = {
  "ai-ml": {
    id: "ai-ml",
    name: "AI/ML Engineering",
    shortName: "AI/ML",
    emoji: "📊",
    tagline: "Teach machines to learn from data.",
    description:
      "AI/ML engineers turn data into predictions and decisions. You clean data, train and evaluate models, and ship them so real products can use them.",
    careerPath: "Data Analyst → ML Engineer → Applied Scientist / ML Platform Engineer",
    skills: ["Python & pandas", "Model training & evaluation", "Statistics basics"],
    project: "Predict whether a customer will leave using a small public dataset and a simple classifier.",
  },
  "cloud-devops": {
    id: "cloud-devops",
    name: "Cloud & DevOps Engineering",
    shortName: "Cloud & DevOps",
    emoji: "☁️",
    tagline: "Make software run reliably, everywhere.",
    description:
      "Cloud and DevOps engineers build the pipelines and infrastructure that ship software safely: automation, containers, monitoring and scaling.",
    careerPath: "Junior DevOps → Cloud Engineer → Site Reliability / Platform Engineer",
    skills: ["Linux & Git", "Docker & CI/CD", "Cloud fundamentals"],
    project: "Containerise a small web app and deploy it automatically with a CI pipeline on every push.",
  },
  fde: {
    id: "fde",
    name: "Forward Deployed Engineering (FDE)",
    shortName: "FDE",
    emoji: "🤝",
    tagline: "Solve real customer problems with code.",
    description:
      "Forward deployed engineers work close to customers, understand messy business problems and build the integrations and tools that actually solve them.",
    careerPath: "Solutions Engineer → Forward Deployed Engineer → Technical Product / Customer Engineering Lead",
    skills: ["APIs & integrations", "Problem discovery", "Communicating with non-engineers"],
    project: "Automate a repetitive spreadsheet task for a club or office using a script and a simple API.",
  },
  mobile: {
    id: "mobile",
    name: "Mobile App Development",
    shortName: "Mobile",
    emoji: "📱",
    tagline: "Build apps people carry in their pocket.",
    description:
      "Mobile developers design and build apps for Android and iOS, caring about smooth interfaces, offline behaviour and real-device performance.",
    careerPath: "Junior Mobile Developer → Mobile Engineer → Senior / Cross-platform Lead",
    skills: ["Flutter, React Native or Kotlin/Swift", "UI state management", "Local storage & APIs"],
    project: "Build a daily habit tracker that saves progress on the device and shows a weekly streak.",
  },
  genai: {
    id: "genai",
    name: "Generative AI Development",
    shortName: "GenAI",
    emoji: "✨",
    tagline: "Build products powered by language models.",
    description:
      "Generative AI developers use large language models to build assistants, search and content tools: prompting, retrieval over documents and output evaluation.",
    careerPath: "Junior AI Developer → GenAI Engineer → LLM Application Architect",
    skills: ["Prompt design", "Retrieval-augmented generation (RAG)", "Evaluating LLM output"],
    project: "Build a chatbot that answers questions from a few PDF notes and cites the passages it used.",
  },
  "agentic-ai": {
    id: "agentic-ai",
    name: "Agentic AI Development",
    shortName: "Agentic AI",
    emoji: "🤖",
    tagline: "Design AI that plans, uses tools and acts.",
    description:
      "Agentic AI developers build systems where a model plans multi-step work, calls tools and APIs, checks its own results and knows when to ask a human.",
    careerPath: "Junior AI Developer → Agent Engineer → AI Systems / Automation Architect",
    skills: ["Tool / function calling", "Planning & state loops", "Guardrails & human-in-the-loop"],
    project: "Build a research agent that searches the web, summarises findings and saves a short report to a file.",
  },
};

export const TRACK_LIST: Track[] = TRACK_IDS.map((id) => TRACKS[id]);

export function isTrackId(value: unknown): value is TrackId {
  return typeof value === "string" && (TRACK_IDS as readonly string[]).includes(value);
}

export function getTrack(id: TrackId): Track {
  return TRACKS[id];
}
