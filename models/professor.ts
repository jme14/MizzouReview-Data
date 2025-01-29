
// basic_info type
export interface BasicInfo {
  fname: string;
  mname?: string;
  lname: string;
  title?: string;
  department: string;
  education?: string;
  tenure?: number;
}

// objective_metrics type
export interface ObjectiveMetrics {
  gpa: number;
  confidence: number;
}

// subjective_metrics type
export interface SubjectiveMetrics {
  quality?: number;
  difficulty?: number;
  gradingIntensity?: number;
  attendance?: number;
  textbook?: number;
  polarizing?: number;
}

// ai_prompt_answers type
export interface AIPromptAnswers {
  letterToProfessor?: string;
  letterToStudent?: string;
  funFacts?: string;
}

// professor type
export interface Professor {
  professorId: string;
  basicInfo?: BasicInfo;
  objectiveMetrics?: ObjectiveMetrics;
  subjectiveMetrics?: SubjectiveMetrics;
  aIPromptAnswers?: AIPromptAnswers;
}