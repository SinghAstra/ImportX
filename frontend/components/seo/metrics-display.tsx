"use client";

import type { KeywordMetrics } from "@/interfaces/seo";
import { BarChart3, DollarSign, Target, TrendingUp } from "lucide-react";

interface MetricsDisplayProps {
  data: KeywordMetrics;
}

export function MetricsDisplay({ data }: MetricsDisplayProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "HIGH":
        return "text-destructive";
      case "MEDIUM":
        return "text-chart-4";
      case "LOW":
        return "text-chart-2";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Keyword Header */}
      <div className="border-l-4 border-primary pl-4">
        <h2 className="text-2xl font-semibold text-foreground">
          {data.keyword}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Keyword Analysis Results
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Volume */}
        <div className="border border-border/40 rounded-lg p-6 bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Search Volume
            </h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatNumber(data.search_volume)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">monthly searches</p>
        </div>

        {/* Cost Per Click */}
        <div className="border border-border/40 rounded-lg p-6 bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-chart-1/10">
              <DollarSign className="w-5 h-5 text-chart-1" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Cost Per Click
            </h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(data.cpc)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">average CPC</p>
        </div>

        {/* Competition */}
        <div className="border border-border/40 rounded-lg p-6 bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-chart-2/10">
              <Target className="w-5 h-5 text-chart-2" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Competition
            </h3>
          </div>
          <p
            className={`text-3xl font-bold ${getCompetitionColor(
              data.competition
            )}`}
          >
            {data.competition}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.competition_index}/100 index
          </p>
        </div>

        {/* Competition Index */}
        <div className="border border-border/40 rounded-lg p-6 bg-muted/5 hover:bg-muted/10 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-md bg-chart-3/10">
              <BarChart3 className="w-5 h-5 text-chart-3" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Difficulty Score
            </h3>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {data.competition_index}
          </p>
          <p className="text-xs text-muted-foreground mt-1">out of 100</p>
        </div>
      </div>

      {/* Bid Range */}
      {(data.low_top_of_page_bid || data.high_top_of_page_bid) && (
        <div className="border border-border/40 rounded-lg p-6 bg-muted/5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Top of Page Bid Range
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Low Bid</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {data.low_top_of_page_bid
                  ? formatCurrency(data.low_top_of_page_bid)
                  : "N/A"}
              </p>
            </div>
            <div className="flex-1 mx-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-chart-2 to-chart-1 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">High Bid</p>
              <p className="text-2xl font-semibold text-foreground mt-1">
                {data.high_top_of_page_bid
                  ? formatCurrency(data.high_top_of_page_bid)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
