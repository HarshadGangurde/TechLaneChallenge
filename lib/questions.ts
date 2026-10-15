import type { Question } from "@/types";

/**
 * The challenge question bank. Scoring lives here, not in the UI:
 *  - "knowledge" questions have a correct option; answering correctly awards XP
 *    and `tracksOnCorrect` affinity points.
 *  - "preference" questions award `scores` points for the chosen option.
 * Keep the questions beginner-friendly: reasoning and interest, not trivia.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1-build",
    kind: "preference",
    category: "What excites you",
    prompt: "If you had a free weekend, what would you most enjoy building?",
    options: [
      { id: "a", label: "A model that predicts something from data", scores: { "ai-ml": 3 } },
      { id: "b", label: "A pipeline that tests and deploys code automatically", scores: { "cloud-devops": 3 } },
      { id: "c", label: "A tool that fixes a real problem for a business", scores: { fde: 3 } },
      { id: "d", label: "An app I can install on my own phone", scores: { mobile: 3 } },
      { id: "e", label: "A chatbot that writes and summarises for me", scores: { genai: 3 } },
      { id: "f", label: "An AI helper that completes tasks by itself", scores: { "agentic-ai": 3 } },
    ],
    explanation: "There are no wrong answers here. This one simply tells us what you are curious about.",
  },
  {
    id: "q2-churn",
    kind: "knowledge",
    category: "Scenario",
    prompt:
      "You have a table of past customers, each marked 'stayed' or 'left'. How could you predict which current customers might leave?",
    options: [
      { id: "a", label: "Train a model on the past customers and test it on ones it has not seen" },
      { id: "b", label: "Sort customers alphabetically and pick the first few" },
      { id: "c", label: "Write a separate rule for every single customer by hand" },
      { id: "d", label: "Only count how many customers there are in total" },
    ],
    correctOptionId: "a",
    tracksOnCorrect: { "ai-ml": 3 },
    explanation:
      "Supervised learning learns patterns from labelled history. Testing on unseen data shows whether it really generalises.",
  },
  {
    id: "q3-deploy",
    kind: "knowledge",
    category: "Debugging",
    prompt: "Your app works on your laptop but crashes after deployment. What do you check first?",
    options: [
      { id: "a", label: "Rewrite the whole app from scratch" },
      { id: "b", label: "Read the deploy logs and compare environment settings, versions and variables" },
      { id: "c", label: "Assume users are doing something wrong" },
      { id: "d", label: "Delete the database and start over" },
    ],
    correctOptionId: "b",
    tracksOnCorrect: { "cloud-devops": 3 },
    explanation:
      "'Works on my machine' is almost always an environment difference: config, versions, secrets or ports. Logs tell you which.",
  },
  {
    id: "q4-process",
    kind: "preference",
    category: "Workflow",
    prompt:
      "A business team repeats the same manual process every week. Which first step appeals to you most?",
    options: [
      { id: "a", label: "Sit with them, map each step, then prototype a small automation", scores: { fde: 3, "agentic-ai": 1 } },
      { id: "b", label: "Look for patterns in their past data to predict what comes next", scores: { "ai-ml": 3 } },
      { id: "c", label: "Move the process onto scheduled, monitored cloud jobs", scores: { "cloud-devops": 3 } },
      { id: "d", label: "Build a simple phone app so they can do it on the go", scores: { mobile: 3 } },
      { id: "e", label: "Use a language model to draft the repetitive text for them", scores: { genai: 3 } },
      { id: "f", label: "Let an AI agent do the steps and ask a human when unsure", scores: { "agentic-ai": 3, genai: 1 } },
    ],
    explanation: "Real problems can be solved many ways. Your instinct shows which kind of builder you lean towards.",
  },
  {
    id: "q5-habits",
    kind: "knowledge",
    category: "Build order",
    prompt: "You are building a daily habit tracker app. Which feature do you build first?",
    options: [
      { id: "a", label: "A leaderboard comparing users worldwide" },
      { id: "b", label: "Animated themes and custom app icons" },
      { id: "c", label: "Marking a habit done today and saving it on the device" },
      { id: "d", label: "Push notifications with marketing offers" },
    ],
    correctOptionId: "c",
    tracksOnCorrect: { mobile: 3 },
    explanation:
      "Build the smallest useful core first (the MVP). Logging a habit and remembering it is the value; the rest is polish.",
  },
  {
    id: "q6-docs",
    kind: "knowledge",
    category: "Architecture",
    prompt:
      "You want an assistant that answers questions from a collection of your documents. Which approach would you explore?",
    options: [
      { id: "a", label: "Split docs into chunks, retrieve the relevant ones, and give them to a language model as context" },
      { id: "b", label: "Ask the model to answer from memory without showing it any documents" },
      { id: "c", label: "Paste every document into every question, however long" },
      { id: "d", label: "Show the user a random document" },
    ],
    correctOptionId: "a",
    tracksOnCorrect: { genai: 3, "agentic-ai": 1 },
    explanation:
      "This is retrieval-augmented generation (RAG): fetch only the relevant passages so answers are grounded in your own documents.",
  },
  {
    id: "q7-loop",
    kind: "knowledge",
    category: "Debugging",
    prompt: "This code crashes with 'Cannot read properties of undefined'. Why?",
    snippet:
      'const items = ["a", "b", "c"];\nfor (let i = 0; i <= items.length; i++) {\n  console.log(items[i].toUpperCase());\n}',
    options: [
      { id: "a", label: "The loop runs one step too far, past the last item" },
      { id: "b", label: "toUpperCase only works on numbers" },
      { id: "c", label: "The array should have been declared with var" },
      { id: "d", label: "console.log is not allowed in loops" },
    ],
    correctOptionId: "a",
    tracksOnCorrect: { fde: 1, mobile: 1, "cloud-devops": 1 },
    explanation:
      "Arrays start at 0, so the last index is length - 1. Using <= reads items[3], which does not exist. Use < instead.",
  },
  {
    id: "q8-agent",
    kind: "knowledge",
    category: "Workflow",
    prompt:
      "An AI system must research a topic online and then save a summary to a file. What does its workflow need?",
    options: [
      { id: "a", label: "A single reply with no access to tools" },
      { id: "b", label: "A loop: plan, call a search tool, read the result, decide the next step, then write the file" },
      { id: "c", label: "A bigger screen" },
      { id: "d", label: "To repeat the same search forever" },
    ],
    correctOptionId: "b",
    tracksOnCorrect: { "agentic-ai": 3, genai: 1 },
    explanation:
      "Agents combine a model with tools and a loop: plan, act, observe, repeat. Good agents also know when to stop or ask a human.",
  },
  {
    id: "q9-satisfying",
    kind: "preference",
    category: "What excites you",
    prompt: "Which moment would feel most satisfying to you?",
    options: [
      { id: "a", label: "Watching your model's accuracy climb after a good idea", scores: { "ai-ml": 3 } },
      { id: "b", label: "Releasing a new version with zero downtime", scores: { "cloud-devops": 3 } },
      { id: "c", label: "A customer saying 'this fixed our actual problem'", scores: { fde: 3 } },
      { id: "d", label: "Seeing your app run smoothly on a real phone", scores: { mobile: 3 } },
      { id: "e", label: "An AI writing something that surprises you", scores: { genai: 3 } },
      { id: "f", label: "Watching an AI finish a multi-step task on its own", scores: { "agentic-ai": 3 } },
    ],
    explanation: "What you enjoy tends to be what you keep practising, which matters more than any single skill.",
  },
  {
    id: "q10-style",
    kind: "preference",
    category: "Working style",
    prompt: "Which way of working sounds most like you?",
    options: [
      { id: "a", label: "Experimenting with data and measuring what works", scores: { "ai-ml": 2, genai: 1 } },
      { id: "b", label: "Automating everything so it runs on its own", scores: { "cloud-devops": 2, "agentic-ai": 1 } },
      { id: "c", label: "Talking to people and turning vague needs into working tools", scores: { fde: 3 } },
      { id: "d", label: "Polishing every pixel and interaction until it feels right", scores: { mobile: 3 } },
      { id: "e", label: "Tinkering with prompts and seeing how models respond", scores: { genai: 3 } },
      { id: "f", label: "Wiring up tools and APIs so a system can act on its own", scores: { "agentic-ai": 2, fde: 1 } },
    ],
    explanation: "Great engineers come in many styles. This helps match you to a track where yours fits.",
  },
];
