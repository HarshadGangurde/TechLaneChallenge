import type { TrackId } from "@/types";

export interface RoadmapStage {
  title: string;
  /** A suggested pace for a beginner studying alongside college or work. Not a promise or a programme schedule. */
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
    { title: "Foundations", pace: "Weeks 1–4", topics: ["Python basics", "NumPy and pandas", "Reading and plotting data", "Basic statistics: mean, spread, distributions"], milestone: "Clean and chart a public dataset, and write down three things you notice." },
    { title: "Core machine learning", pace: "Weeks 5–10", topics: ["Regression and classification", "Train and test splits", "scikit-learn", "Accuracy, precision and recall", "Spotting overfitting"], milestone: "Predict customer churn with a simple classifier and explain how well it works." },
    { title: "Go deeper", pace: "Weeks 11–16", topics: ["Feature engineering", "Cross-validation", "Clustering", "A first neural network in PyTorch or TensorFlow"], milestone: "Compare three models on one problem and explain why the best one won." },
    { title: "Ship it", pace: "Weeks 17–24", topics: ["Wrapping a model in a small API", "A simple web demo", "Tracking experiments", "Writing a clear README"], milestone: "A deployed demo on GitHub that someone else can try in a minute." },
  ],
  "cloud-devops": [
    { title: "Foundations", pace: "Weeks 1–4", topics: ["Linux command line", "Git and GitHub", "Networking basics: DNS, HTTP, ports", "Small scripts in Bash or Python"], milestone: "Host a simple website from a Linux machine or virtual machine." },
    { title: "Containers and CI", pace: "Weeks 5–10", topics: ["Docker and docker compose", "Running tests on every push with GitHub Actions", "Environment variables and secrets"], milestone: "Containerise a small app and build a pipeline that tests it automatically." },
    { title: "Cloud", pace: "Weeks 11–16", topics: ["One cloud provider: AWS, Azure or Google Cloud", "Compute, storage and permissions", "Infrastructure as code with Terraform", "Deploying a container"], milestone: "Your app deploys itself to the cloud whenever you push code." },
    { title: "Reliability", pace: "Weeks 17–24", topics: ["Logs, metrics and alerts", "Scaling and backups", "Security basics: least privilege, rotating keys"], milestone: "A dashboard and an alert for your app, plus a one-page runbook for fixing it." },
  ],
  fde: [
    { title: "Foundations", pace: "Weeks 1–4", topics: ["One language: Python or JavaScript", "APIs and JSON", "SQL basics", "Git"], milestone: "A script that pulls data from a public API and saves it neatly." },
    { title: "Integrations", pace: "Weeks 5–10", topics: ["REST and webhooks", "Authentication basics", "Cleaning messy data", "Automating spreadsheets and CSV files"], milestone: "Automate a messy weekly report from start to finish." },
    { title: "Understand the customer", pace: "Weeks 11–16", topics: ["Asking good discovery questions", "Mapping a workflow", "Scoping what to build first", "Explaining ideas to non-technical people"], milestone: "Map a real process, for example at a local shop, and propose a small fix." },
    { title: "Deliver and support", pace: "Weeks 17–24", topics: ["Building the small tool", "A short handover guide", "Collecting feedback", "Iterating"], milestone: "A tool used by a real person, with a one-page case study of what changed." },
  ],
  mobile: [
    { title: "Foundations", pace: "Weeks 1–4", topics: ["Programming basics in Kotlin, Dart or JavaScript", "Screen layout basics", "Git"], milestone: "Recreate one screen of an app you like." },
    { title: "Your first app", pace: "Weeks 5–10", topics: ["Pick a path: Flutter, React Native, or native Android or iOS", "State and navigation", "Saving data on the phone"], milestone: "A habit tracker that remembers your habits after you close it." },
    { title: "Real-world apps", pace: "Weeks 11–16", topics: ["Calling APIs", "Loading, empty and error states", "Offline use", "Permissions and accessibility"], milestone: "An app that shows a list from an API and still works with a bad connection." },
    { title: "Release", pace: "Weeks 17–24", topics: ["Testing on real devices", "Performance basics", "Store listings, screenshots and privacy notes"], milestone: "A beta-tested or published app, with feedback from real users." },
  ],
  genai: [
    { title: "Foundations", pace: "Weeks 1–4", topics: ["Python basics", "How language models work at a high level: tokens and context", "Using a chat model well"], milestone: "Write five prompts for one task and compare the answers." },
    { title: "Prompting and APIs", pace: "Weeks 5–10", topics: ["System prompts and structured outputs", "Calling a language model API", "Handling errors and cost"], milestone: "A small app that summarises text or notes." },
    { title: "Grounding with RAG", pace: "Weeks 11–16", topics: ["Embeddings and vector search", "Splitting documents into chunks", "Citing sources"], milestone: "A chatbot that answers from your own PDFs and shows the passages it used." },
    { title: "Quality and safety", pace: "Weeks 17–24", topics: ["Testing answers on a fixed set of questions", "Reducing made-up answers", "Handling private data safely"], milestone: "An evaluation sheet that shows how your prompts and retrieval improved." },
  ],
  "agentic-ai": [
    { title: "Foundations", pace: "Weeks 1–4", topics: ["Python and APIs", "How models call tools (function calling)", "Working with JSON"], milestone: "A language model that calls one tool, such as a weather lookup." },
    { title: "Your first agent", pace: "Weeks 5–10", topics: ["The plan, act and observe loop", "Keeping memory of past steps", "Designing clear tools"], milestone: "A research agent that searches, reads and saves a summary to a file." },
    { title: "Reliability", pace: "Weeks 11–16", topics: ["Limits and retries", "Asking a human before risky actions", "Logging every step", "Permissions and guardrails"], milestone: "An agent that asks before doing anything risky and logs everything it did." },
    { title: "Real workflows", pace: "Weeks 17–24", topics: ["Multi-step workflows such as booking meetings", "Testing on realistic scenarios and edge cases", "Simple multi-agent ideas"], milestone: "An agent with a written list of test scenarios, including the awkward ones." },
  ],
};
