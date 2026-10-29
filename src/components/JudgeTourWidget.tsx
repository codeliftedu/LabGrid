import React, { useState } from 'react';
import { CheckCircle2, Compass, ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import { TourStepProgress, UserRole } from '../types/labgrid';

interface JudgeTourWidgetProps {
  steps: TourStepProgress[];
  onJumpToStep: (step: TourStepProgress) => void;
  onToggleStepComplete: (stepNumber: number) => void;
  activeRole: UserRole;
}

export const JudgeTourWidget: React.FC<JudgeTourWidgetProps> = ({
  steps,
  onJumpToStep,
  onToggleStepComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96 bg-slate-900 text-white rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {/* Compact Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-900 hover:bg-slate-800/90 transition-colors cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-bold tracking-tight text-white">
              Guided 90-Second Judge Tour
            </div>
            <div className="text-[11px] font-mono text-slate-400 tabular-nums">
              {completedCount} / {steps.length} LIFECYCLE STEPS VERIFIED
            </div>
          </div>
        </div>
        <button
          type="button"
          className="p-1 text-slate-400 hover:text-white rounded"
          aria-label="Toggle Judge Tour"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Checklist Body */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 border-t border-slate-800 bg-slate-950/95">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-3 hover:bg-slate-900/90 transition-colors flex items-start justify-between gap-2.5"
            >
              <button
                type="button"
                onClick={() => onToggleStepComplete(step.stepNumber)}
                className="mt-0.5 text-slate-400 hover:text-emerald-400 shrink-0"
                title="Mark step verified"
              >
                <CheckCircle2
                  className={`w-4 h-4 ${
                    step.completed ? 'text-emerald-400' : 'text-slate-600'
                  }`}
                />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                  <span className={step.completed ? 'line-through text-slate-400' : ''}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {step.description}
                </p>
                <div className="text-[10px] font-mono text-indigo-400 mt-1">
                  PILLAR: {step.pillar.toUpperCase()} · ROLE: {step.targetRole}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onJumpToStep(step)}
                className="px-2.5 py-1 text-[11px] font-mono font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Open</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
