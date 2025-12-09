"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export function ValueProposition() {
  return (
    <div className="max-w-lg flex items-center justify-center mx-auto">
      <div className="relative">
        <div
          aria-hidden="true"
          className="
          absolute -top-16 -left-16 text-[18rem]  
          leading-none font-serif text-foreground/5  
          z-0
        "
        >
          &ldquo;
        </div>
        <div className="relative border border-border/40 bg-background/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center">
          {/* Star Rating */}
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-yellow-400" />
            ))}
          </div>

          {/* The Hook Quote */}
          <blockquote className="space-y-6">
            <p className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground text-balance">
              &ldquo;I stopped trying to hire the perfect marketing team. I just
              deployed <span className="text-primary">Synap OS</span>{" "}
              instead.&rdquo;
            </p>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              Before, we juggled 4 agencies for SEO, Ads, and Content. Now,
              Synap&apos;s 16 agents handle the research, drafting, and posting
              autonomously. It&apos;s not just a tool; it&apos;s our entire
              digital workforce.
            </p>
          </blockquote>

          {/* User Profile */}
          <div className="mt-10 flex flex-col items-center justify-center space-y-3">
            <div className="p-1 rounded-full border border-border/50 bg-background">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src="https://avatar.vercel.sh/alex-rivera"
                  alt="Alex Rivera"
                />
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-foreground">Alex Rivera</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>CMO at TechFlow</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Saved $120k/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
