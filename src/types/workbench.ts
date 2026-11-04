export type LabMode = "practice" | "demo" | "challenge" | "hands-on";

export type Exp1Subpart = "hardness" | "chloride" | "sulfate" | "tds" | "ph";

export interface ReagentInventoryItem {
  id: string;
  name: string;
  formula: string;
  concentration?: string;
  volumeAvailableMl: number;
  category: "analyte" | "titrant" | "indicator" | "buffer" | "solvent" | "standard";
  hazardNote?: string;
}

export interface ApparatusToolItem {
  id: string;
  name: string;
  specification: string;
  category: "glassware" | "instrument" | "meter" | "accessory";
  isPlacedOnBench: boolean;
}

export interface InspectorState {
  currentObjective: string;
  hint: string;
  equations: string[];
  speciesBreakdown?: { name: string; formula: string; amount: string; status: string }[];
  proceduralWarning?: string | null;
  theorySummary?: string;
}

export interface NotebookEntry {
  id: string;
  timestamp: string;
  subpart: Exp1Subpart;
  parameter: string;
  value: number;
  unit: string;
  trialNumber?: number;
  notes?: string;
}

