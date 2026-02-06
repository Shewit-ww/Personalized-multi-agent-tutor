
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Layout, 
  Activity, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  RefreshCw,
  Award,
  BarChart2,
  Sparkles,
  Send
} from 'lucide-react';
import { CourseState, AgentRole, Module, SubModule, AgentLog, QuizQuestion } from './types';
import { agentService } from './services/geminiService';
import CurriculumView from './components/CurriculumView';
import LessonView from './components/LessonView';
import QuizView from './components/QuizView';
import AgentTerminal from './components/AgentTerminal';
import ProgressReport from './components/ProgressReport';

const FEATURED_COURSES = [
  { title: 'Python for Beginners', description: 'Master the basics of programming with the world\'s most popular language.', icon: '🐍' },
  { title: 'World History: The Enlightenment', description: 'Explore the revolutionary ideas that shaped modern democracy.', icon: '📜' },
  { title: 'High School Algebra II', description: 'Simplify complex equations and master quadratic functions.', icon: '🔢' },
  { title: 'Digital Marketing 101', description: 'Learn how to grow brands in the modern digital landscape.', icon: '📈' }
];

const App: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [courseState, setCourseState] = useState<CourseState>({
    subject: '',
    modules: [],
    logs: [],
    isThinking: false,
    requiresHumanApproval: false,
  });

  const [activeTab, setActiveTab] = useState<'roadmap' | 'lesson' | 'quiz' | 'report'>('roadmap');

  const addLog = (agent: AgentRole, thought: string, action: string, result?: any) => {
    const newLog: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      agent,
      thought,
      action,
      result
    };
    setCourseState(prev => ({ ...prev, logs: [newLog, ...prev.logs].slice(0, 50) }));
  };

  const startCourse = async (selectedSubject?: string) => {
    const targetSubject = selectedSubject || subject;
    if (!targetSubject) return;

    setCourseState(prev => ({ ...prev, isThinking: true, subject: targetSubject }));
    addLog(AgentRole.SUPERVISOR, `Initiating Shewit Learning Protocol for "${targetSubject}".`, "Deciding next step...");
    
    try {
      const decision = await agentService.supervisorDecide({
        subject: targetSubject,
        modules: courseState.modules,
        currentSub: courseState.currentSubModuleId || null,
        lastAction: "Initialize Course"
      });

      addLog(AgentRole.SUPERVISOR, decision.reason, `Invoke ${decision.agent}`);

      if (decision.agent === AgentRole.CURRICULUM_PLANNER) {
        if (decision.requiresApproval) {
          setCourseState(prev => ({ 
            ...prev, 
            isThinking: false, 
            requiresHumanApproval: true,
            pendingAction: { agent: AgentRole.CURRICULUM_PLANNER, action: 'Generate Roadmap', params: {} }
          }));
          return;
        }
        await executeCurriculumPlanning(targetSubject);
      }
    } catch (error) {
      console.error(error);
      addLog(AgentRole.SUPERVISOR, "Error starting course", "Wait for user input");
    } finally {
      setCourseState(prev => ({ ...prev, isThinking: false }));
    }
  };

  const executeCurriculumPlanning = async (targetSubject?: string) => {
    const sub = targetSubject || subject;
    setCourseState(prev => ({ ...prev, isThinking: true, requiresHumanApproval: false }));
    addLog(AgentRole.CURRICULUM_PLANNER, `Designing curriculum for ${sub}`, "Building Modules and Submodules");
    
    const modules = await agentService.planCurriculum(sub);
    setCourseState(prev => ({ ...prev, modules, isThinking: false }));
    addLog(AgentRole.CURRICULUM_PLANNER, "Curriculum defined.", "Modules loaded", modules);
    setActiveTab('roadmap');
  };

  const handleSubmoduleSelect = async (moduleId: string, subId: string) => {
    setCourseState(prev => ({ ...prev, currentModuleId: moduleId, currentSubModuleId: subId, isThinking: true }));
    const sub = courseState.modules.find(m => m.id === moduleId)?.submodules.find(s => s.id === subId);
    
    if (!sub) return;

    addLog(AgentRole.SUPERVISOR, `Student selected submodule: ${sub.title}`, `Invoking ${AgentRole.CONCEPT_EXPLAINER}`);

    try {
      const rawExplanation = await agentService.explainConcept(courseState.subject, sub.title, sub.description);
      addLog(AgentRole.CONCEPT_EXPLAINER, "Drafting explanation content.", "Waiting for Evaluator critique...");

      const evaluation = await agentService.evaluateContent(rawExplanation);
      addLog(AgentRole.EVALUATOR, evaluation.feedback, evaluation.approved ? "Approved" : "Improving content");

      const finalExplanation = evaluation.improvedContent || rawExplanation;

      setCourseState(prev => ({
        ...prev,
        modules: prev.modules.map(m => ({
          ...m,
          submodules: m.submodules.map(s => s.id === subId ? { ...s, content: finalExplanation, status: 'available' } : s)
        })),
        isThinking: false
      }));
      setActiveTab('lesson');
    } catch (e) {
      setCourseState(prev => ({ ...prev, isThinking: false }));
    }
  };

  const startQuiz = async () => {
    const currentSub = courseState.modules
      .find(m => m.id === courseState.currentModuleId)
      ?.submodules.find(s => s.id === courseState.currentSubModuleId);

    if (!currentSub || !currentSub.content) return;

    setCourseState(prev => ({ ...prev, isThinking: true }));
    addLog(AgentRole.ASSESSMENT_GENERATOR, "Creating knowledge check questions.", "Analyzing lesson context...");

    try {
      const quiz = await agentService.generateAssessment(currentSub.title, currentSub.content);
      setCourseState(prev => ({
        ...prev,
        modules: prev.modules.map(m => ({
          ...m,
          submodules: m.submodules.map(s => s.id === currentSub.id ? { ...s, quiz } : s)
        })),
        isThinking: false
      }));
      setActiveTab('quiz');
      addLog(AgentRole.ASSESSMENT_GENERATOR, "Assessment ready.", "Waiting for student response");
    } catch (e) {
      setCourseState(prev => ({ ...prev, isThinking: false }));
    }
  };

  const handleQuizSubmit = async (score: number) => {
    const subId = courseState.currentSubModuleId;
    setCourseState(prev => ({
      ...prev,
      modules: prev.modules.map(m => ({
        ...m,
        submodules: m.submodules.map(s => s.id === subId ? { ...s, score, status: 'completed' } : s)
      }))
    }));

    addLog(AgentRole.FEEDBACK_ANALYZER, `Student scored ${Math.round(score * 100)}%`, "Updating Progress Tracker");
    setActiveTab('report');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startCourse();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Shewit tutoring center</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Personalized Multi-Agent Education</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {courseState.modules.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current:</span>
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                {courseState.subject}
              </span>
            </div>
          )}
          <button 
            onClick={() => {
              setCourseState(prev => ({ ...prev, modules: [], currentModuleId: undefined, currentSubModuleId: undefined }));
              setActiveTab('roadmap');
              setSubject('');
            }}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
            title="New Session"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'roadmap', label: 'Curriculum', icon: Layout, disabled: false },
              { id: 'lesson', label: 'Current Lesson', icon: Activity, disabled: courseState.modules.length === 0 },
              { id: 'quiz', label: 'Assessment', icon: CheckCircle, disabled: courseState.modules.length === 0 },
              { id: 'report', label: 'Progress Report', icon: BarChart2, disabled: courseState.modules.length === 0 },
            ].map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.disabled ? 'opacity-30 cursor-not-allowed' :
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-inner' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-100">
             <div className="bg-slate-900 text-slate-100 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Agent Network</span>
                </div>
                <div className="text-[10px] space-y-2">
                  <div className="flex justify-between items-center opacity-80">
                    <span className="text-slate-400">Supervisor</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Planner</span>
                    <span className={courseState.isThinking ? "text-indigo-400 animate-pulse font-bold" : "text-slate-600"}>
                      {courseState.isThinking ? "Working..." : "Standby"}
                    </span>
                  </div>
                </div>
             </div>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {courseState.isThinking && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-indigo-100 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl animate-in slide-in-from-top-4 duration-300 z-50">
              <div className="relative">
                <RefreshCw className="animate-spin text-indigo-600" size={20} />
                <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-bounce" size={12} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Agent Intelligence</span>
                <span className="text-[10px] text-slate-500 font-medium">Synthesizing personalized data...</span>
              </div>
            </div>
          )}

          {courseState.requiresHumanApproval && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 mb-8 flex items-start gap-6 animate-in zoom-in duration-300 shadow-lg shadow-amber-100/50">
              <div className="bg-amber-100 p-4 rounded-2xl text-amber-700">
                <AlertCircle size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-amber-900 uppercase tracking-tight">Supervisor: Pause for Approval</h3>
                <p className="text-slate-700 mt-2 leading-relaxed">
                  The <span className="font-bold text-indigo-600">{courseState.pendingAction?.agent}</span> is proposing a significant update to your 
                  <span className="italic font-medium"> "{courseState.pendingAction?.action}"</span>. 
                  This will re-structure your entire curriculum roadmap. Do you want our agents to proceed?
                </p>
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => executeCurriculumPlanning()}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                  >
                    Approve Roadmap
                  </button>
                  <button 
                    onClick={() => setCourseState(prev => ({ ...prev, requiresHumanApproval: false }))}
                    className="bg-white border border-amber-300 text-amber-800 px-8 py-3 rounded-2xl text-sm font-bold hover:bg-amber-100 transition-all"
                  >
                    Hold for now
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            {activeTab === 'roadmap' && (
              <>
                {courseState.modules.length === 0 ? (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-16">
                      <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                        <Sparkles size={14} />
                        Next-Gen Tutoring
                      </div>
                      <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4">What would you like to master today?</h2>
                      <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                        Our specialized agent team will design a personalized curriculum just for you.
                      </p>
                    </div>

                    <div className="max-w-2xl mx-auto mb-16">
                      <form onSubmit={handleChatSubmit} className="relative group">
                        <input 
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Type a subject or describe your goal (e.g. 'Advanced calculus for engineering')"
                          className="w-full bg-white border-2 border-slate-200 rounded-3xl px-8 py-6 pr-20 text-lg shadow-2xl shadow-slate-200/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none group-hover:border-slate-300"
                        />
                        <button 
                          type="submit"
                          disabled={!subject || courseState.isThinking}
                          className="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-indigo-200 active:scale-90"
                        >
                          <Send size={24} />
                        </button>
                      </form>
                      <div className="flex justify-center gap-4 mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Curriculum Planner</span>
                        <span>•</span>
                        <span>Concept Explainer</span>
                        <span>•</span>
                        <span>Evaluator</span>
                      </div>
                    </div>

                    <div className="mb-12">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-200 flex-1" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Or choose a Featured Path</h3>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURED_COURSES.map((course) => (
                          <button
                            key={course.title}
                            onClick={() => {
                              setSubject(course.title);
                              startCourse(course.title);
                            }}
                            className="group bg-white p-6 rounded-3xl border border-slate-200 text-left hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-2"
                          >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{course.icon}</div>
                            <h4 className="font-black text-slate-800 mb-2 leading-tight">{course.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{course.description}</p>
                            <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              Plan Roadmap <ChevronRight size={12} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <CurriculumView 
                    modules={courseState.modules} 
                    onSelectSubmodule={handleSubmoduleSelect} 
                    currentSubId={courseState.currentSubModuleId}
                  />
                )}
              </>
            )}
            {activeTab === 'lesson' && (
              <LessonView 
                submodule={courseState.modules.find(m => m.id === courseState.currentModuleId)?.submodules.find(s => s.id === courseState.currentSubModuleId)} 
                onTakeQuiz={startQuiz}
              />
            )}
            {activeTab === 'quiz' && (
              <QuizView 
                questions={courseState.modules.find(m => m.id === courseState.currentModuleId)?.submodules.find(s => s.id === courseState.currentSubModuleId)?.quiz || []}
                onComplete={handleQuizSubmit}
              />
            )}
            {activeTab === 'report' && (
              <ProgressReport 
                modules={courseState.modules}
              />
            )}
          </div>
        </div>

        <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Terminal size={14} className="text-indigo-600" />
              Agent Intelligence Feed
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AgentTerminal logs={courseState.logs} />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
