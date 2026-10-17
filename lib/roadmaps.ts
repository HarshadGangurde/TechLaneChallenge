import type { TrackId } from "@/types";

export interface RoadmapStage {
  title: string;
  /** A suggested pace for a beginner studying alongside college or work. Four two-week stages, eight weeks in all. Not a promise or a programme schedule. */
  pace: string;
  topics: string[];
  /** A concrete thing to build or show at the end of the stage. */
  milestone: string;
}

/**
 * Beginner roadmaps, one per track. Copy deliberately avoids fees, cohort dates,
 * placement claims and links to specific paid courses.
 */
export const ROADMAPS: Record<TrackId, RoadmapStage[]> = {
  "ai-ml": [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["Python basics", "Loading and cleaning data with pandas", "Simple charts", "Mean, spread and distributions"], milestone: "Clean and chart a public dataset, and write down three things you notice." },
    { title: "Core machine learning", pace: "Weeks 3–4", topics: ["Regression and classification", "Train and test splits", "scikit-learn basics", "Accuracy, precision and recall"], milestone: "Predict customer churn with a simple classifier and explain how well it works." },
    { title: "Go deeper", pace: "Weeks 5–6", topics: ["Spotting overfitting", "Cross-validation", "Feature engineering basics", "Clustering"], milestone: "Compare three models on one problem and explain why the best one won." },
    { title: "Ship it", pace: "Weeks 7–8", topics: ["Wrapping a model in a small API or app", "A simple web demo", "Writing a clear README"], milestone: "A demo on GitHub that someone else can try in a minute." },
  ],
  "cloud-devops": [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["Linux command line", "Git and GitHub", "Networking basics: DNS, HTTP, ports", "Small Bash scripts"], milestone: "Host a simple website from a Linux machine or virtual machine." },
    { title: "Containers", pace: "Weeks 3–4", topics: ["Docker basics", "Running several containers with docker compose", "Environment variables and secrets"], milestone: "Containerise a small app and start it with a single command." },
    { title: "CI and cloud", pace: "Weeks 5–6", topics: ["Running tests on every push with GitHub Actions", "One cloud provider's free tier: compute and storage", "Deploying a container"], milestone: "Your app deploys to the cloud whenever you push code." },
    { title: "Reliability", pace: "Weeks 7–8", topics: ["Logs and simple alerts", "Backups and the idea of scaling", "Security basics: least privilege, rotating keys"], milestone: "A simple dashboard or alert for your app, plus a one-page runbook for fixing it." },
  ],
  fde: [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["One language: Python or JavaScript", "APIs and JSON", "SQL basics", "Git"], milestone: "A script that pulls data from a public API and saves it neatly." },
    { title: "Integrations", pace: "Weeks 3–4", topics: ["REST and webhooks", "Cleaning messy data", "Automating spreadsheets and CSV files"], milestone: "Automate a messy weekly report from start to finish." },
    { title: "Understand the customer", pace: "Weeks 5–6", topics: ["Asking good discovery questions", "Mapping a workflow", "Scoping what to build first"], milestone: "Map a real process, for example at a local shop, and propose a small fix." },
    { title: "Deliver and support", pace: "Weeks 7–8", topics: ["Building the small tool", "A short handover guide", "Collecting feedback"], milestone: "A small tool that one real person tries, with a one-page note of what changed." },
  ],
  mobile: [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["Programming basics in Kotlin, Dart or JavaScript", "Screen layout basics", "Git"], milestone: "Recreate one screen of an app you like." },
    { title: "Your first app", pace: "Weeks 3–4", topics: ["Pick a path: Flutter, React Native, or native Android or iOS", "State and navigation", "Saving data on the phone"], milestone: "A habit tracker that remembers your habits after you close it." },
    { title: "Real-world apps", pace: "Weeks 5–6", topics: ["Calling an API", "Loading, empty and error states", "Permissions and accessibility"], milestone: "An app that shows a list from an API and handles a bad connection." },
    { title: "Release", pace: "Weeks 7–8", topics: ["Testing on real devices", "Performance basics", "Store listings and privacy notes"], milestone: "A beta-tested app, with feedback from a few real users." },
  ],
  genai: [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["Python basics", "How language models work at a high level: tokens and context", "Using a chat model well"], milestone: "Write five prompts for one task and compare the answers." },
    { title: "Prompting and APIs", pace: "Weeks 3–4", topics: ["System prompts and structured outputs", "Calling a language model API", "Handling errors and cost"], milestone: "A small app that summarises text or notes." },
    { title: "Grounding with RAG", pace: "Weeks 5–6", topics: ["Embeddings and vector search", "Splitting documents into chunks", "Citing sources"], milestone: "A chatbot that answers from your own PDFs and shows the passages it used." },
    { title: "Quality and safety", pace: "Weeks 7–8", topics: ["Testing answers on a fixed set of questions", "Reducing made-up answers", "Handling private data safely"], milestone: "An evaluation sheet that shows how your prompts improved." },
  ],
  "agentic-ai": [
    { title: "Foundations", pace: "Weeks 1–2", topics: ["Python and APIs", "How models call tools (function calling)", "Working with JSON"], milestone: "A language model that calls one tool, such as a weather lookup." },
    { title: "Your first agent", pace: "Weeks 3–4", topics: ["The plan, act and observe loop", "Keeping memory of past steps", "Designing clear tools"], milestone: "A research agent that searches, reads and saves a summary to a file." },
    { title: "Reliability", pace: "Weeks 5–6", topics: ["Limits and retries", "Asking a human before risky actions", "Logging every step"], milestone: "An agent that asks before doing anything risky and logs everything it did." },
    { title: "Real workflows", pace: "Weeks 7–8", topics: ["A multi-step workflow such as booking meetings", "Testing on realistic scenarios and edge cases", "Simple guardrails and permissions"], milestone: "An agent with a written list of test scenarios, including the awkward ones." },
  ],
};
