
export enum AgentRole {
  SUPERVISOR = 'Supervisor',
  CURRICULUM_PLANNER = 'Curriculum Planner',
  CONCEPT_EXPLAINER = 'Concept Explainer',
  ASSESSMENT_GENERATOR = 'Assessment Generator',
  EVALUATOR = 'Evaluator',
  FEEDBACK_ANALYZER = 'Feedback Analyzer',
  PROGRESS_TRACKER = 'Progress Tracker'
}

export interface SubModule {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
  content?: string;
  quiz?: QuizQuestion[];
  score?: number;
}

export interface Module {
  id: string;
  title: string;
  submodules: SubModule[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  agent: AgentRole;
  thought: string;
  action: string;
  result?: any;
}

export interface CourseState {
  subject: string;
  modules: Module[];
  currentModuleId?: string;
  currentSubModuleId?: string;
  logs: AgentLog[];
  isThinking: boolean;
  requiresHumanApproval: boolean;
  pendingAction?: {
    agent: AgentRole;
    action: string;
    params: any;
  };
}

export interface ProgressStats {
  completedSubmodules: number;
  totalSubmodules: number;
  averageScore: number;
  learningVelocity: number;
}
