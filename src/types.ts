export type AnalysisType = 'pros_cons' | 'swot' | 'comparison';

export interface ProConItem {
  id: string;
  text: string;
  category: string;
  weight: number; // 1 to 5
  explanation: string;
}

export interface OptionProsCons {
  optionName: string;
  pros: ProConItem[];
  cons: ProConItem[];
  score?: number; // Dynamically calculated or generated
}

export interface ProsConsResult {
  optionsAnalysis: OptionProsCons[];
  verdict: {
    recommendation: string;
    summary: string;
    confidenceScore: number; // 1 to 100
  };
}

export interface SwotItem {
  id: string;
  text: string;
  impact: number; // 1 to 5
  explanation: string;
}

export interface SwotResult {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  verdict: {
    recommendation: string;
    summary: string;
    keyActionableTakeaway: string;
  };
}

export interface Criterion {
  name: string;
  description: string;
  weight: number; // 1 to 5
}

export interface OptionRating {
  optionName: string;
  rating: number; // 1 to 5
  explanation: string;
}

export interface ComparisonRow {
  criterionName: string;
  ratings: OptionRating[];
}

export interface ComparisonResult {
  criteria: Criterion[];
  options: string[];
  matrix: ComparisonRow[];
  verdict: {
    recommendation: string;
    summary: string;
    directComparisonSummary: string;
  };
}

export interface Decision {
  id: string;
  title: string;
  context?: string;
  createdAt: string;
  analysisType: AnalysisType;
  options: string[];
  result: ProsConsResult | SwotResult | ComparisonResult;
}
