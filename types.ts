export enum SpeakerRole {
  JUDGE = 'Judge',
  PROSECUTOR = 'Prosecutor',
  DEFENSE = 'Defense Attorney',
  WITNESS = 'Witness',
  DEFENDANT = 'Defendant',
  SYSTEM = 'System'
}

export interface Witness {
  name: string;
  role: string;
  testimony: string;
  personality: string;
}

export interface Evidence {
  item: string;
  description: string;
}

export interface CaseData {
  title: string;
  defendantName: string;
  crime: string;
  summary: string;
  prosecutionOpening: string;
  defenseOpening: string;
  evidence: Evidence[];
  witnesses: Witness[];
  correctVerdict: string;
  reasoning: string;
  keyPoints: string[]; // Hints for the judge
}

export interface ChatMessage {
  id: string;
  role: SpeakerRole;
  speakerName: string;
  text: string;
  timestamp: Date;
}

export enum GamePhase {
  MENU = 'MENU',
  LOADING = 'LOADING',
  TRIAL = 'TRIAL',
  VERDICT = 'VERDICT',
  EVALUATION = 'EVALUATION'
}

export interface VerdictResult {
  verdict: 'Guilty' | 'Not Guilty';
  sentence?: string;
  reasoning: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  title: string;
}