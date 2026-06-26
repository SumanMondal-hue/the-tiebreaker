import React, { useState } from 'react';
import { Decision, AnalysisType } from '../types';
import { Plus, Trash2, Search, BarChart3, Columns, Compass, ChevronLeft, ChevronRight, Scale } from 'lucide-react';

interface HistorySidebarProps {
  decisions: Decision[];
  activeDecisionId: string | null;
  onSelectDecision: (id: string | null) => void;
  onDeleteDecision: (id: string) => void;
  onStartNew: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function HistorySidebar({
  decisions,
  activeDecisionId,
  onSelectDecision,
  onDeleteDecision,
  onStartNew,
  isOpen,
  setIsOpen
}: HistorySidebarProps) {
  const [search, setSearch] = useState('');

  const filtered = decisions.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.context && d.context.toLowerCase().includes(search.toLowerCase()))
  );

  const getBadgeStyle = (type: AnalysisType) => {
    switch (type) {
      case 'pros_cons':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'swot':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'comparison':
        return 'bg-sky-50 text-sky-700 border-sky-200/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50';
    }
  };

  const getBadgeIcon = (type: AnalysisType) => {
    switch (type) {
      case 'pros_cons':
        return <Columns className="w-3.5 h-3.5 mr-1" />;
      case 'swot':
        return <Compass className="w-3.5 h-3.5 mr-1" />;
      case 'comparison':
        return <BarChart3 className="w-3.5 h-3.5 mr-1" />;
    }
  };

  const getTypeName = (type: AnalysisType) => {
    switch (type) {
      case 'pros_cons':
        return 'Pros & Cons';
      case 'swot':
        return 'SWOT';
      case 'comparison':
        return 'Comparison';
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 md:static md:z-0 ${
        isOpen ? 'w-80' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Scale className="h-4 w-4" />
          </div>
          <span className="font-sans font-semibold tracking-tight text-slate-900 text-lg">
            The Tiebreaker
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 md:hidden"
        >
          <ChevronLeft className="h-5 h-5" />
        </button>
      </div>

      {/* Action Area */}
      <div className="p-4">
        <button
          onClick={onStartNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-md shadow-indigo-100 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Decision</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search decisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <span className="text-xs font-medium text-slate-400">No decisions found</span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 text-xs text-slate-600 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filtered.map((decision) => {
              const isActive = decision.id === activeDecisionId;
              const formattedDate = new Date(decision.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={decision.id}
                  className={`group relative flex flex-col rounded-xl p-3 transition-all cursor-pointer border-l-4 ${
                    isActive
                      ? 'bg-indigo-50/40 text-indigo-950 font-semibold border-indigo-600'
                      : 'hover:bg-slate-50/70 text-slate-600 border-transparent'
                  }`}
                  onClick={() => onSelectDecision(decision.id)}
                >
                  <div className="flex items-start justify-between gap-2 pr-6">
                    <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">
                      {decision.title}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{formattedDate}</span>
                    <div
                      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${getBadgeStyle(
                        decision.analysisType
                      )}`}
                    >
                      {getBadgeIcon(decision.analysisType)}
                      {getTypeName(decision.analysisType)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDecision(decision.id);
                    }}
                    className="absolute top-2.5 right-2 rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-rose-600 focus:opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Decision"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
