import { RepoSubmissionPanel } from "@/features/repo/components/repo-submission-panel";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Analyze your GitHub repositories, view file summaries, and map out your code architecture.",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center py-12 md:py-20 lg:py-24">
      <RepoSubmissionPanel />
    </div>
  );
}
