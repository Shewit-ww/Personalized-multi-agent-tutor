
import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, ArrowRight, Award } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (questions.length === 0) {
    return <div className="p-10 text-center">No questions generated yet.</div>;
  }

  const currentQuestion = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    const correct = idx === currentQuestion.correctAnswer;
    setAnswers([...answers, correct]);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIdx(null);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    const correctCount = answers.filter(a => a).length;
    return correctCount / questions.length;
  };

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="text-center py-20 animate-in zoom-in duration-500">
        <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <Award className="text-emerald-600" size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Completed!</h2>
        <p className="text-slate-500 mb-8">Your results have been processed by the Feedback Analyzer.</p>
        
        <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-sm mx-auto shadow-xl mb-10">
          <div className="text-6xl font-black text-indigo-600 mb-2">{Math.round(score * 100)}%</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Final Score</div>
        </div>

        <button 
          onClick={() => onComplete(score)}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
        >
          View Full Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Knowledge Check</h2>
          <p className="text-slate-500">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-8 rounded-full transition-all duration-500 ${
                i === currentIdx ? 'bg-indigo-600' : i < currentIdx ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-8">{currentQuestion.question}</h3>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let stateStyle = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
            if (selectedIdx !== null) {
              if (idx === currentQuestion.correctAnswer) {
                stateStyle = "bg-emerald-50 border-emerald-500 text-emerald-900";
              } else if (idx === selectedIdx) {
                stateStyle = "bg-red-50 border-red-500 text-red-900";
              } else {
                stateStyle = "opacity-50 border-slate-200";
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedIdx !== null}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between font-medium ${stateStyle}`}
              >
                <span>{option}</span>
                {selectedIdx !== null && idx === currentQuestion.correctAnswer && <Check className="text-emerald-600" />}
                {selectedIdx === idx && idx !== currentQuestion.correctAnswer && <X className="text-red-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedIdx !== null && (
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={nextQuestion}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-3"
          >
            {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
