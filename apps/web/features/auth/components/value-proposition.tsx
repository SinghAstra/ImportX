"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { siteConfig } from "@/config/site";

export function ValueProposition() {
  return (
    <div className="max-w-lg flex items-center justify-center mx-auto">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -top-16 -left-16 text-[18rem]  
          leading-none font-serif text-foreground/5  
          z-0"
        >
          &ldquo;
        </div>
        <blockquote className="space-y-4 relative z-10">
          <p className="text-2xl leading-relaxed font-semibold text-balance">
            {siteConfig.name} is absolute magic. Dropped a messy legacy repo in,
            and had a crystal-clear visual map with clean AI summaries for every
            file in under 30 seconds. Onboarding saved.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/user.jpg" alt="Alex Rivera" />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-foreground">Alex Rivera</p>
              <p className="text-xs text-muted-foreground">
                Senior Full-Stack Engineer
              </p>
            </div>
          </div>
        </blockquote>
      </div>
    </div>
  );
}
