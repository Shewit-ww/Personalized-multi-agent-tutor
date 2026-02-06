
import React from 'react';
import { SubModule } from '../types';
import { BookOpen, ArrowRight, Lightbulb, PlayCircle } from 'lucide-react';

interface LessonViewProps {
  submodule?: SubModule;
  onTakeQuiz: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ submodule, onTakeQuiz }) => {
  if (!submodule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-100 p-8 rounded-full mb-6">
          <BookOpen size={48} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Choose a submodule to start learning</h2>
        <p className="text-slate-500 mt-2">The Concept Explainer will generate lesson content for you.</p>
      </div>
    );
  }

  if (!submodule.content) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-40 bg-slate-200 rounded w-full mt-10"></div>
      </div>
    );
  }

  // Simple Markdown-like renderer for the content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-slate-800">{line.replace('###', '')}</h3>;
      if (line.startsWith('##')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-slate-900">{line.replace('##', '')}</h2>;
      if (line.startsWith('-')) return <li key={i} className="ml-6 mb-2 text-slate-700">{line.replace('-', '').trim()}</li>;
      if (line.startsWith('```')) return null; // Simplified code block handling
      
      // Handle bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-indigo-700">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return <p key={i} className="mb-4 text-slate-700 leading-relaxed">{renderedLine}</p>;
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-4">
        <PlayCircle size={16} />
        Module Lesson
      </div>
      <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight">{submodule.title}</h1>
      
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-12">
        <div className="prose prose-indigo max-w-none">
          {renderContent(submodule.content)}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-indigo-100 p-4 rounded-2xl">
          <Lightbulb size={40} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-indigo-900 mb-1">Knowledge Check Ready</h3>
          <p className="text-indigo-800/70 text-sm">
            Ready to prove what you've learned? The Assessment Generator has prepared a quick quiz for you.
          </p>
        </div>
        <button 
          onClick={onTakeQuiz}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 whitespace-nowrap"
        >
          Start Assessment
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LessonView;
