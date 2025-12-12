export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: "HIGH" | "MEDIUM" | "LOW";
  competition_index: number;
  low_top_of_page_bid?: number;
  high_top_of_page_bid?: number;
}

export interface SeoAnalysisResult {
  metrics: KeywordMetrics;
  timestamp: string;
}
