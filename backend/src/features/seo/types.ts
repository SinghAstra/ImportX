// The sanitized data we want to return to our Frontend
export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: "HIGH" | "MEDIUM" | "LOW";
  competition_index: number;
  low_top_of_page_bid?: number;
  high_top_of_page_bid?: number;
}

// The raw shape from DataForSEO (simplified for what we need)
export interface DataForSeoResponse {
  tasks: {
    result: {
      keyword: string;
      search_volume: number; // Monthly average
      cpc: number;
      competition: "HIGH" | "MEDIUM" | "LOW";
      competition_index: number; // 0-100
      low_top_of_page_bid: number;
      high_top_of_page_bid: number;
    }[];
  }[];
}
