"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface KeywordSearchProps {
  onSearch: (keyword: string) => void;
  isLoading?: boolean;
}

export function KeywordSearch({ onSearch, isLoading }: KeywordSearchProps) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 ">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter keyword to analyze (e.g., AI marketing, SEO tools)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={isLoading}
            className="pl-10 h-10 text-base bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !keyword.trim()}
          size="lg"
          className="px-8 h-10"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
    </form>
  );
}
