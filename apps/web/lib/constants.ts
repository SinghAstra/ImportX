import { RepositoryStatus } from "@repo/shared";
import { Cpu, Link2, Sparkles } from "lucide-react";

export const processSteps = [
  {
    title: "Paste Repository URL",
    description:
      "Just drop the link to any public GitHub repository. No complex local setups, no API access tokens, and zero initial configuration required.",
    icon: Link2,
  },
  {
    title: "Automated Ingestion",
    description:
      "Our high-performance background queue instantly pulls the code, maps your folder hierarchy, and tracks vital filesystem structural metrics.",
    icon: Cpu,
  },
  {
    title: "Explore with AI Insight",
    description:
      "Click through a smooth, interactive nested code tree and instantly view resilient, deep AI summaries for every single folder and file.",
    icon: Sparkles,
  },
];

export const reviews = [
  {
    name: "Michael Chen",
    rating: 5,
    review:
      "A total lifesaver for onboarding. I had to dive into a legacy 50k LOC repo, and SummaryX mapped the entire codebase into a clean interactive tree in seconds. I actually understood the system before my first standup.",
  },
  {
    name: "Emily Watson",
    rating: 5,
    review:
      "The AI file summaries are incredibly accurate. It doesn't just skim the code; it tells you exactly what the file does in plain English. It's like having the original maintainer sitting right next to you explaining the files.",
  },
  {
    name: "David Kumar",
    rating: 5,
    review:
      "I use this daily for open-source work. Instead of spending hours opening a hundred different folders on GitHub, I get an immediate map of the project. It has significantly speed up my contribution speed.",
  },
  {
    name: "Sophia Rossi",
    rating: 4,
    review:
      "Fantastic tool for exploring new frameworks. The interactive tree explorer helped me understand how core modules interact without me having to clone the whole project and grep everything locally.",
  },
  {
    name: "James Thompson",
    rating: 5,
    review:
      "Absolutely game-changing for technical leads. I use it to audit external libraries before we add them to our monorepo. The instant file breakdowns give us total code clarity with zero setup overhead.",
  },
  {
    name: "Olivia Zhang",
    rating: 4,
    review:
      "Simple, effective, and fast. It completely takes the guesswork out of complex, messy GitHub repos. Getting a clear view of an entire folder structure with working summaries is a massive time-saver.",
  },
  {
    name: "William Smith",
    rating: 5,
    review:
      "SummaryX is now a permanent part of my developer workflow. If you deal with large or unfamiliar codebases frequently, this isn't just a luxury—it's a necessity for maintaining your sanity and development speed.",
  },
  {
    name: "Mia Lindholm",
    rating: 5,
    review:
      "I've tried other repository analysis tools, but they usually just generate a giant, unreadable graph diagram. SummaryX actually gives me clean, readable, and logical summaries of what each file is doing.",
  },
  {
    name: "Henry Fletcher",
    rating: 5,
    review:
      "This has completely transformed how our team handles technical alignment. We drop the repository link into SummaryX first to give everyone an instant high-level map of the codebase architecture before writing code.",
  },
];

export const FAQ = [
  {
    id: "item-1",
    question: "How does SummaryX work?",
    answer:
      "Just paste a GitHub link. Our AI automatically scans the project, figures out how everything connects, and instantly builds a clean, interactive map with simple summaries for every single file.",
  },
  {
    id: "item-2",
    question: "Do I need to download or clone anything?",
    answer:
      "Not at all! SummaryX runs entirely in your browser. You don't have to download heavy folders or touch your computer's terminal. Paste the link, and we handle the rest in seconds.",
  },
  {
    id: "item-3",
    question: "Is my code safe? Will it train the AI?",
    answer:
      "Your code is 100% safe. We never use your code, projects, or intellectual property to train AI models. What's yours stays yours.",
  },
  {
    id: "item-4",
    question: "What programming languages do you support?",
    answer:
      "We support almost all popular languages, including JavaScript, TypeScript, Python, Rust, Go, and Java. Plus, we add support for more language setups every single month.",
  },
  {
    id: "item-5",
    question: "Can it handle massive or messy codebases?",
    answer:
      "Yes! SummaryX is built for messy code. Whether it's a tiny weekend hobby app or a giant corporate system, we break the files down into simple, bite-sized summaries so you don't get overwhelmed.",
  },
  {
    id: "item-6",
    question: "Can I use it on private repositories?",
    answer:
      "Right now, SummaryX works with any public GitHub repository. Private repository support is our top priority and is launching very soon so you can map your private team projects.",
  },
  {
    id: "item-7",
    question: "Are the AI summaries actually accurate?",
    answer:
      "Yes. Our AI doesn't just look at a single file in a vacuum. It reads how files talk to each other across the entire codebase, giving you smart summaries that explain what the code actually does in plain English.",
  },
  {
    id: "item-8",
    question: "Who is SummaryX built for?",
    answer:
      "It's perfect for developers onboarding to a new job, open-source contributors trying to make a quick fix, or tech leads auditing a new library before adding it to their system.",
  },
];

export const STATUS_BORDER_MAP: Record<RepositoryStatus, string> = {
  PENDING: "border border-yellow-400 border-2",
  PROCESSING: "border border-yellow-400 border-2",
  COMPLETED: "border border-green-400 border-2",
  FAILED: "border border-red-400 border-2",
} as const;
