import {Name} from "../../src/models/name"
export class BasicInfo {
    name: Name;
    department: string;
    title?: string;
    education?: string;
    tenure?: number;

    constructor(
        name: Name,
        department: string,
        options: {
            title?: string;
            education?: string;
            tenure?: number;
        } = {},
    ) {
        this.name = name
        this.department = department;
        this.title = options.title;
        this.education = options.education;
        this.tenure = options.tenure;
    }
    toString(): string{
        return (this.name + this.department).replace("/","")
    }
}

export class ObjectiveMetrics {
    constructor(public gpa: number, public confidence: number) {
        if (gpa < 0 || gpa > 4.0) {
            throw new Error('Invalid gpa provided');
        }
        if (confidence > 100 || confidence < 0) {
            throw new Error('Invalid confidence provided');
        }
        this.gpa = gpa;
        this.confidence = confidence;
    }
}

export class SubjectiveMetrics {
    quality?: number;
    difficulty?: number;
    gradingIntensity?: number;
    attendance?: number;
    textbook?: number;
    polarizing?: number;

    constructor(
        options: {
            quality?: number;
            difficulty?: number;
            gradingIntensity?: number;
            attendance?: number;
            textbook?: number;
            polarizing?: number;
        } = {},
    ) {
        const {
            quality,
            difficulty,
            gradingIntensity,
            attendance,
            textbook,
            polarizing,
        } = options;

        // Validation logic
        const validateMetric = (value?: number) => {
            if (value !== undefined && (value < 0 || value > 10)) {
                throw new Error('Metric values must be between 0 and 10');
            }
        };

        validateMetric(quality);
        validateMetric(difficulty);
        validateMetric(gradingIntensity);
        validateMetric(attendance);
        validateMetric(textbook);
        validateMetric(polarizing);

        this.quality = quality;
        this.difficulty = difficulty;
        this.gradingIntensity = gradingIntensity;
        this.attendance = attendance;
        this.textbook = textbook;
        this.polarizing = polarizing;
    }
}

export class AIPromptAnswers {
    letterToProfessor?: string;
    letterToStudent?: string;
    funFacts?: string;

    constructor(options: {
        letterToProfessor?: string;
        letterToStudent?: string;
        funFacts?: string;
    }) {
        this.letterToProfessor = options.letterToProfessor;
        this.letterToStudent = options.letterToStudent;
        this.funFacts = options.funFacts;
    }
}

export class Professor {
    professorId: string;
    basicInfo?: BasicInfo;
    objectiveMetrics?: ObjectiveMetrics;
    subjectiveMetrics?: SubjectiveMetrics;
    aIPromptAnswers?: AIPromptAnswers;
    constructor(
        professorId: string,
        options?: {
            basicInfo?: BasicInfo;
            objectiveMetrics?: ObjectiveMetrics;
            subjectiveMetrics?: SubjectiveMetrics;
            aIPromptAnswers?: AIPromptAnswers;
        },
    ) {
        this.professorId = professorId;
        if (options) {
            this.basicInfo = options.basicInfo;
            this.objectiveMetrics = options.objectiveMetrics;
            this.subjectiveMetrics = options.subjectiveMetrics;
            this.aIPromptAnswers = options.aIPromptAnswers;
        }
    }
    static initFromObject(jsonObject: any) {
        if (!jsonObject.professorId) {
            throw new Error('Missing professorId');
        }

        // Create a BasicInfo instance if the object has the necessary fields
        const basicInfo = jsonObject.basicInfo
            ? new BasicInfo(
                  jsonObject.basicInfo.name,
                  jsonObject.basicInfo.department,
                  {
                      title: jsonObject.basicInfo.title,
                      education: jsonObject.basicInfo.education,
                      tenure: jsonObject.basicInfo.tenure,
                  },
              )
            : undefined;

        // Create an ObjectiveMetrics instance if the object has the necessary fields
        const objectiveMetrics = jsonObject.objectiveMetrics
            ? new ObjectiveMetrics(
                  jsonObject.objectiveMetrics.gpa,
                  jsonObject.objectiveMetrics.confidence,
              )
            : undefined;

        // Create a SubjectiveMetrics instance if the object has the necessary fields
        const subjectiveMetrics = jsonObject.subjectiveMetrics
            ? new SubjectiveMetrics({
                  quality: jsonObject.subjectiveMetrics.quality,
                  difficulty: jsonObject.subjectiveMetrics.difficulty,
                  gradingIntensity:
                      jsonObject.subjectiveMetrics.gradingIntensity,
                  attendance: jsonObject.subjectiveMetrics.attendance,
                  textbook: jsonObject.subjectiveMetrics.textbook,
                  polarizing: jsonObject.subjectiveMetrics.polarizing,
              })
            : undefined;

        // Create an AIPromptAnswers instance if the object has the necessary fields
        const aIPromptAnswers = jsonObject.aIPromptAnswers
            ? new AIPromptAnswers({
                  letterToProfessor:
                      jsonObject.aIPromptAnswers.letterToProfessor,
                  letterToStudent: jsonObject.aIPromptAnswers.letterToStudent,
                  funFacts: jsonObject.aIPromptAnswers.funFacts,
              })
            : undefined;

        // Return a new Professor instance
        return new Professor(jsonObject.professorId, {
            basicInfo,
            objectiveMetrics,
            subjectiveMetrics,
            aIPromptAnswers,
        });
    }
    // Method to stringify the Professor object
    toString(): string {
        const basicInfoStr = this.basicInfo
            ? JSON.stringify(this.basicInfo)
            : 'No Basic Info';
        const objectiveMetricsStr = this.objectiveMetrics
            ? JSON.stringify(this.objectiveMetrics)
            : 'No Objective Metrics';
        const subjectiveMetricsStr = this.subjectiveMetrics
            ? JSON.stringify(this.subjectiveMetrics)
            : 'No Subjective Metrics';
        const aIPromptAnswersStr = this.aIPromptAnswers
            ? JSON.stringify(this.aIPromptAnswers)
            : 'No AI Prompt Answers';

        return `Professor { 
      professorId: ${this.professorId}, 
      basicInfo: ${basicInfoStr}, 
      objectiveMetrics: ${objectiveMetricsStr}, 
      subjectiveMetrics: ${subjectiveMetricsStr}, 
      aIPromptAnswers: ${aIPromptAnswersStr} 
    }`;
    }
}
