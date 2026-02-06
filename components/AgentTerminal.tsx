
import React from 'react';
import { AgentLog, AgentRole } from '../types';

interface AgentTerminalProps {
  logs: AgentLog[];
}

const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
  const getAgentColor = (role: AgentRole) => {
    switch (role) {
      case AgentRole.SUPERVISOR: return 'text-amber-500';
      case AgentRole.CURRICULUM_PLANNER: return 'text-blue-500';
      case AgentRole.CONCEPT_EXPLAINER: return 'text-emerald-500';
      case AgentRole.ASSESSMENT_GENERATOR: return 'text-rose-500';
      case AgentRole.EVALUATOR: return 'text-purple-500';
      case AgentRole.FEEDBACK_ANALYZER: return 'text-cyan-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-4 font-mono text-[11px] leading-relaxed">
      {logs.length === 0 && (
        <div className="text-slate-400 italic text-center py-10">
          No logs yet. Start the course to see agent activity.
        </div>
      )}
      {logs.map((log) => (
        <div key={log.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
            <span className={`font-bold uppercase tracking-wider ${getAgentColor(log.agent)}`}>
              {log.agent}
            </span>
            <span className="text-slate-300">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="mt-2">
            <span className="text-slate-400 block mb-1">Thought:</span>
            <p className="text-slate-600 italic">"{log.thought}"</p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-50">
             <span className="text-slate-400 block mb-1">Action:</span>
             <p className="font-bold text-slate-800">{log.action}</p>
          </div>
          {log.result && typeof log.result === 'object' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-indigo-600 font-bold hover:underline">View Payload</summary>
              <pre className="mt-2 bg-slate-900 text-slate-300 p-2 rounded overflow-x-auto text-[10px]">
                {JSON.stringify(log.result, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentTerminal;
