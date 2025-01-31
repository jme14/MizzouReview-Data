// basic_info type
interface IBasicInfo {
  fname: string;
  mname?: string;
  lname: string;
  title?: string;
  department: string;
  education?: string;
  tenure?: number;
}

export class BasicInfo implements BasicInfo{
  
}

// objective_metrics type
interface IObjectiveMetrics {
  gpa: number;
  confidence: number;
}


export class ObjectiveMetrics implements IObjectiveMetrics{
  private _gpa!: number;
  private _confidence!: number;

  constructor(gpa: number, confidence: number){
    this.gpa = gpa;
    this.confidence = confidence;
  }

  get gpa(){
    return this._gpa
  }
  set gpa(gpa: number){
    if (gpa < 0 || gpa > 4.0){
      throw new Error("Invalid gpa provided");
    }
    this._gpa = gpa
  }

  get confidence(){
    return this._confidence
  }
  set confidence(confidence: number){
    if (confidence > 100 || confidence < 0){
      throw new Error("Invalid confidence provided")
    }
    this._confidence = confidence
  }
}

// subjective_metrics type
interface ISubjectiveMetrics {
  quality?: number;
  difficulty?: number;
  gradingIntensity?: number;
  attendance?: number;
  textbook?: number;
  polarizing?: number;
}

export class SubjectiveMetrics implements ISubjectiveMetrics{

}

// ai_prompt_answers type
interface IAIPromptAnswers {
  letterToProfessor?: string;
  letterToStudent?: string;
  funFacts?: string;
}
export class AIPromptAnswers implements IAIPromptAnswers{

}

// professor type
interface IProfessor {
  professorId: string;
  basicInfo?: IBasicInfo;
  objectiveMetrics?: IObjectiveMetrics;
  subjectiveMetrics?: ISubjectiveMetrics;
  aIPromptAnswers?: IAIPromptAnswers;
}

export class Professor implements IProfessor {
  constructor(public professorId: string) {}

}
