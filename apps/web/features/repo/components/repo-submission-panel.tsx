"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ingestRepoSchema, type IngestRepoInput } from "@repo/shared";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useIngestRepo } from "../hooks/use-ingest-repo";

export function RepoSubmissionPanel() {
  const router = useRouter();

  const { mutateAsync: ingestRepo, isPending } = useIngestRepo();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IngestRepoInput>({
    resolver: zodResolver(ingestRepoSchema),
    defaultValues: { githubUrl: "" },
  });

  const onSubmit = async (values: IngestRepoInput) => {
    toast.promise(ingestRepo(values), {
      loading: "Connecting to GitHub...",
      success: (data) => {
        reset();

        router.push(`/repo/${data.repositoryId}`);

        return data.isDuplicate
          ? "Repository Already exists."
          : "Repository linked! Analysis started.";
      },
      error: (err: Error) => err.message,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">
        Analyze any GitHub repository
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        Get instant file summaries and map out your code architecture with AI.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full relative bg-muted/10 hover:bg-muted/30 border rounded p-1 transition-all duration-300 shadow-sm focus-within:shadow-md"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Input
              {...register("githubUrl")}
              type="text"
              placeholder="Paste public repository URL..."
              disabled={isPending}
              className="w-full p-2 py-3 pr-4 bg-transparent disabled:bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground/60 font-mono rounded-none"
            />
          </div>

          <div className="flex items-center justify-end px-1.5 sm:px-0">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto rounded transition-transform active:scale-[0.98] select-none cursor-pointer flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Wait...
                </>
              ) : (
                <>
                  Analyze
                  <CornerDownLeft className="hidden sm:inline size-3 text-primary-foreground/80" />
                </>
              )}
            </Button>
          </div>
        </div>

        {errors.githubUrl && (
          <div className="absolute left-0 -bottom-7 bg-background text-destructive text-xs font-medium px-2 py-0.5 rounded border border-destructive/20 shadow-sm animate-in fade-in duration-200">
            {errors.githubUrl.message}
          </div>
        )}
      </form>
    </div>
  );
}
