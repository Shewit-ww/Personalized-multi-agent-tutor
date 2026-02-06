
import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole, Module, QuizQuestion, SubModule } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

export const agentService = {
  // 1. SUPERVISOR: Decides who acts next
  async supervisorDecide(state: { subject: string; modules: Module[]; currentSub: string | null; lastAction: string }) {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are the Supervisor of an AI Tutoring Team for the subject "${state.subject}".
      Current Course State: ${JSON.stringify(state.modules)}
      Current Active Submodule: ${state.currentSub || 'None'}
      Last Action Taken: ${state.lastAction}

      Your job is to decide the NEXT agent to invoke.
      Roles available:
      - 'Curriculum Planner': Use if the roadmap is empty or needs major updates.
      - 'Concept Explainer': Use if the student is ready to learn a specific submodule.
      - 'Assessment Generator': Use if the student has just finished learning a concept and needs to be tested.
      - 'Progress Tracker': Use if you need to summarize overall performance.
      - 'Human Approval': Use if you are about to make a major change to the roadmap or the content is sensitive.

      Return your decision in JSON format with properties: 'agent', 'reason', 'parameters' (optional object), 'requiresApproval' (boolean).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agent: { type: Type.STRING },
            reason: { type: Type.STRING },
            parameters: { 
              type: Type.OBJECT,
              description: "Optional context parameters for the next agent.",
              properties: {
                moduleId: { type: Type.STRING, description: "ID of the target module if applicable" },
                submoduleId: { type: Type.STRING, description: "ID of the target submodule if applicable" }
              }
            },
            requiresApproval: { type: Type.BOOLEAN }
          },
          required: ["agent", "reason", "requiresApproval"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  // 2. CURRICULUM PLANNER: Creates the roadmap
  async planCurriculum(subject: string): Promise<Module[]> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Act as a Curriculum Planner. Create a learning roadmap for "${subject}".
      Divide it into 3-5 logical Modules. Each Module should have 2-4 SubModules.
      Each submodule needs an id, title, and a short description.
      Return the result as a JSON array of Modules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              submodules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    status: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "status"]
                }
              }
            },
            required: ["id", "title", "submodules"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  // 3. CONCEPT EXPLAINER: Explains concepts
  async explainConcept(subject: string, submoduleTitle: string, description: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Act as a Concept Explainer. Teach the concept "${submoduleTitle}" within the course "${subject}".
      Context: ${description}.
      Provide a clear, engaging explanation in Markdown. 
      Use examples, code blocks if relevant, and bold text for key terms. Keep it concise but thorough.`,
    });
    return response.text;
  },

  // 4. ASSESSMENT GENERATOR: Creates MCQ
  async generateAssessment(submoduleTitle: string, content: string): Promise<QuizQuestion[]> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Act as an Assessment Generator. Create 3 multiple choice questions based on the following content:
      "${content}"
      
      For each question, provide 4 options and the index of the correct answer (0-3).
      Return as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER }
            },
            required: ["id", "question", "options", "correctAnswer"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  // 5. EVALUATOR: Critiques content
  async evaluateContent(content: string): Promise<{ approved: boolean; feedback: string; improvedContent?: string }> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Act as an Evaluator. Critique the following tutoring explanation for clarity, accuracy, and tone:
      "${content}"
      
      Decide if it is approved. If not, provide feedback and a better version.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            approved: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            improvedContent: { type: Type.STRING }
          },
          required: ["approved", "feedback"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  // 6. FEEDBACK ANALYZER: Scores student's answer
  async analyzeFeedback(question: string, studentAnswer: string, correctAnswer: string): Promise<{ score: number; tip: string }> {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Act as a Feedback Analyzer. 
      Question: ${question}
      Student Choice: ${studentAnswer}
      Correct Answer: ${correctAnswer}
      
      Analyze why the student might be right or wrong. Give a helpful tip.
      Return JSON with score (0-1) and tip string.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            tip: { type: Type.STRING }
          },
          required: ["score", "tip"]
        }
      }
    });
    return JSON.parse(response.text);
  }
};
