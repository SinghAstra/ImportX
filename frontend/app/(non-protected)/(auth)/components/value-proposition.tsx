"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

        <blockquote className="space-y-6">
          <p className="text-2xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground text-balance">
            I stopped trying to hire the perfect marketing team. I just deployed{" "}
            <span className="text-primary">Synap OS</span> instead.
          </p>
        </blockquote>

        <div className="mt-10 flex gap-2 items-center">
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
  );
}
