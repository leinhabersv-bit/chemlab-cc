export type ExperimentId =
  | "exp-1"
  | "exp-2"
  | "exp-3"
  | "exp-4"
  | "exp-5"
  | "exp-6"
  | "exp-7"
  | "exp-8"
  | "exp-9"
  | "exp-10";

export type ExperimentStatus = "ready" | "planned" | "in-development";

export interface SourceReference {
  pageStart: number;
  pageEnd: number;
  manualTitle: string;
  syllabusCode: string;
  academicYear: string;
  verifiedEquations: string[];
  inconsistenciesNoted: string[];
}

export interface ApparatusItem {
  id: string;
  name: string;
  specification: string;
  category: "glassware" | "instrument" | "meter" | "heating" | "hardware" | "accessory";
  iconName?: string;
}

export interface ChemicalReagent {
  id: string;
  name: string;
  formula: string;
  concentration?: string;
  role: "analyte" | "titrant" | "indicator" | "buffer" | "precursor" | "solvent" | "electrolyte";
  hazardWarning?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks: number;
}

export interface ExperimentMetadata {
  id: ExperimentId;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  aim: string;
  category: "Analytical & Environmental" | "Nanomaterials & Synthesis" | "Energy & Electrochemistry" | "Kinetics & Dynamics";
  status: ExperimentStatus;
  source: SourceReference;
  learningOutcomes: string[];
  apparatus: ApparatusItem[];
  chemicals: ChemicalReagent[];
  quiz: QuizQuestion[];
  subparts?: {
    id: string;
    title: string;
    description: string;
    principle: string;
  }[];
}
