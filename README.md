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
  Creates a structured learning roadmap by dividing Python into modules and submodules.

- **Concept Explainer Agent**  
  Explains Python concepts in simple and understandable language.

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


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

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
