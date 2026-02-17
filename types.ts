export interface PropertyDetails {
  city: string;
  type: string;
  area: string;
  areaCovered: string;
  areaSemi: string;
  areaOpen: string;
  isArgentina: boolean;
  age: string;
  renovationLevel: string;
  hasFloorPlan?: boolean;
  floorPlanCurrent?: FileData | null;
  floorPlanRemodel?: FileData | null;
  listingDescription?: string;
  listingImage?: FileData | null;
  address?: string;
}

export interface InterventionDecision {
  status: 'approved' | 'rejected' | 'modified' | 'pending';
  modificationNote?: string;
}

export interface GlobalProjectDecisions {
  electricity: 'pending' | 'approved' | 'rejected';
  plumbing: 'pending' | 'approved' | 'rejected';
  painting: 'pending' | 'approved' | 'rejected';
  skirting: 'pending' | 'approved' | 'rejected';
  flooring: 'pending' | 'approved' | 'rejected';
  flooringMaterial: string;
}

export interface DiagnosisResult {
  analysis: string;
  suggestions: Array<{
    title: string;
    description: string;
    actionOptions: string[]; 
  }>; 
  structuredAnalysis?: {
    generalState: string;
    pathologies: string;
    ageSuggestionElectric: string; 
    ageSuggestionPlumbing: string;
    interventions: Array<{
      id: string;
      task: string;
      materials: string;
      roiJustification: string;
    }>;
  };
}

export interface Room {
  id: string;
  name: string;
  description: string;
  images: FileData[];
  diagnosis: DiagnosisResult | string | null;
  decisions: Record<string, InterventionDecision>;
  tasks: string | null;
  userNotes: string;
  generatedImages: (string | null)[];
  isAnalyzing: boolean;
  isRendering: boolean[];
  renderPrompts?: string[]; // Instrucciones personalizadas por render
  length: string;
  width: string;
  area: string;
  isIrregular: boolean;
}

export interface FileData {
  id: string;
  data: string;
  mimeType: string;
}

export type AppStep = 'onboarding' | 'floorplan' | 'rooms' | 'diagnosis' | 'planning' | 'results';
