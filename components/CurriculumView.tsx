
import React from 'react';
// Added Layout to imports from lucide-react
import { ChevronRight, Lock, CheckCircle, Circle, ArrowRight, Layout } from 'lucide-react';
import { Module, SubModule } from '../types';

interface CurriculumViewProps {
  modules: Module[];
  onSelectSubmodule: (moduleId: string, subId: string) => void;
  currentSubId?: string;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({ modules, onSelectSubmodule, currentSubId }) => {
  if (modules.length === 0) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-2">
          <Layout size={14} />
          Personalized Roadmap
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Learning Path</h2>
        <p className="text-slate-500 mt-2 font-medium">Follow this step-by-step structure optimized for your mastery.</p>
      </div>

      <div className="relative pl-8 border-l-2 border-slate-200 space-y-16 ml-4">
        {modules.map((module, mIdx) => (
          <div key={module.id} className="relative">
            <div className="absolute -left-[49px] top-0 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg border-4 border-slate-50 shadow-xl shadow-indigo-100">
              {mIdx + 1}
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800">{module.title}</h3>
              <div className="h-1.5 w-12 bg-indigo-600 rounded-full mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {module.submodules.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubmodule(module.id, sub.id)}
                  className={`group relative text-left p-8 rounded-[2rem] border-2 transition-all duration-500 ${
                    currentSubId === sub.id 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.02] z-10'
                      : sub.status === 'completed'
                        ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 hover:border-emerald-300'
                        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${
                      currentSubId === sub.id ? 'bg-indigo-500/50' : sub.status === 'completed' ? 'bg-emerald-100' : 'bg-slate-50'
                    }`}>
                      {sub.status === 'completed' ? (
                        <CheckCircle size={20} className="text-emerald-600" />
                      ) : sub.status === 'available' ? (
                        <Circle size={20} className="text-indigo-400" />
                      ) : (
                        <Lock size={20} className="text-slate-300" />
                      )}
                    </div>
                    {sub.score !== undefined && (
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-emerald-100">
                        {Math.round(sub.score * 100)}% MASTERY
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-xl mb-3 leading-tight tracking-tight">{sub.title}</h4>
                  <p className={`text-sm leading-relaxed font-medium ${currentSubId === sub.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {sub.description}
                  </p>
                  
                  <div className={`mt-8 flex items-center gap-2 text-xs font-black transition-transform group-hover:translate-x-2 ${
                    currentSubId === sub.id ? 'text-white' : 'text-indigo-600'
                  }`}>
                    {currentSubId === sub.id ? 'RESUME MODULE' : 'START LESSON'}
                    <ArrowRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumView;
