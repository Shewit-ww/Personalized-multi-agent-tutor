# Multi-Agent Personalized Education Tutor

## 1. Chosen Use Case & Rationale

This project implements a **multi-agent adaptive tutoring system for Python programming**.  
The system personalizes learning by coordinating multiple specialized agents such as curriculum planning, concept explanation, assessment generation, and feedback analysis.

The multi-agent architecture was chosen to simulate a real tutoring team where each agent focuses on a specific educational task, improving learning quality and adaptability.

---

## 2. Agent Team Design

### Agents and Roles

- **Supervisor Agent**  
  Coordinates all tutoring agents, decides which agent should act next, and determines when to request human approval.

- **Curriculum Planner Agent**  
  Creates a structured learning roadmap by dividing the course of interest into modules and submodules.

- **Concept Explainer Agent**  
  Explains concepts in simple and understandable language.

- **Assessment Generator Agent**  
  Generates multiple-choice questions (MCQs) based on covered topics and provides interactive options for students.

- **Evaluator Agent**  
  Reviews outputs of other agents to improve clarity and reduce hallucinations.

- **Feedback Analyzer Agent**  
  Analyzes student answers and provides corrective feedback.

- **Progress Tracker & Report Generator Agent**  
  Tracks student progress and generates learning reports and performance summaries.

---

### Communication Flow Diagram
```mermaid
flowchart TD

    U1[User] --> S1[Supervisor]
    S1 --> CP[Curriculum Planner]
    CP --> U2[User Review]
    U2 --> S2[Supervisor]
    S2 --> CE[Concept Explainer]
    CE --> EV[Evaluator]
    EV --> U3[User Learning]
    U3 --> AG[Assessment Generator]
    AG --> U4[User Answers]
    U4 --> FA[Feedback Analyzer]

    %% Styling
    classDef user fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px,color:#000;
    classDef agent fill:#e8f5e9,stroke:#43a047,stroke-width:2px,color:#000;
    classDef supervisor fill:#fff3e0,stroke:#fb8c00,stroke-width:2px,color:#000;

    class U1,U2,U3,U4 user;
    class CP,CE,EV,AG,FA agent;
    class S1,S2 supervisor;
```


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1YmXIyQI66wa6iiVYaOWEzopSI340gWnj

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
