import React, { useState } from 'react';
import { SwotResult, SwotItem } from '../types';
import { Plus, Trash2, ArrowUp, ArrowDown, Activity, ShieldAlert, Award, TrendingUp } from 'lucide-react';

interface SwotViewProps {
  result: SwotResult;
  onChange: (updatedResult: SwotResult) => void;
}

export default function SwotView({ result, onChange }: SwotViewProps) {
  const [newText, setNewText] = useState<{ [key: string]: string }>({});
  const [newImpact, setNewImpact] = useState<{ [key: string]: number }>({});

  const calculateTotal = (items: SwotItem[]) => items.reduce((sum, item) => sum + item.impact, 0);

  const totalS = calculateTotal(result.strengths);
  const totalW = calculateTotal(result.weaknesses);
  const totalO = calculateTotal(result.opportunities);
  const totalT = calculateTotal(result.threats);

  // Vitality Ratio: Positive drivers (S + O) vs Negative limiters (W + T)
  const positiveDrivers = totalS + totalO;
  const negativeLimiters = totalW + totalT;
  const vitalityRatio = negativeLimiters > 0 ? (positiveDrivers / negativeLimiters).toFixed(2) : positiveDrivers.toFixed(2);

  const handleImpactChange = (quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', itemIdx: number, val: number) => {
    const updated = { ...result };
    updated[quadrant][itemIdx].impact = val;
    onChange(updated);
  };

  const handleDeleteItem = (quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', itemIdx: number) => {
    const updated = { ...result };
    updated[quadrant] = updated[quadrant].filter((_, idx) => idx !== itemIdx);
    onChange(updated);
  };

  const handleAddItem = (quadrant: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') => {
    const text = newText[quadrant]?.trim();
    if (!text) return;

    const impact = newImpact[quadrant] || 3;
    const newItem: SwotItem = {
      id: `${quadrant}_custom_${Date.now()}`,
      text,
      impact,
      explanation: 'Manually added SWOT factor.'
    };

    const updated = { ...result };
    updated[quadrant].push(newItem);

    // Reset fields
    setNewText({ ...newText, [quadrant]: '' });
    setNewImpact({ ...newImpact, [quadrant]: 3 });

    onChange(updated);
  };

  const getQuadrantMeta = (quad: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') => {
    switch (quad) {
      case 'strengths':
        return {
          title: 'Strengths (Internal)',
          color: 'emerald',
          borderColor: 'border-emerald-100',
          bgColor: 'bg-emerald-50/15 border-emerald-500/10',
          textColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          icon: <Award className="h-5 w-5 text-emerald-600" />
        };
      case 'weaknesses':
        return {
          title: 'Weaknesses (Internal)',
          color: 'amber',
          borderColor: 'border-amber-100',
          bgColor: 'bg-amber-50/15 border-amber-500/10',
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800',
          icon: <ShieldAlert className="h-5 w-5 text-amber-600" />
        };
      case 'opportunities':
        return {
          title: 'Opportunities (External)',
          color: 'sky',
          borderColor: 'border-sky-100',
          bgColor: 'bg-sky-50/15 border-sky-500/10',
          textColor: 'text-sky-700',
          badgeBg: 'bg-sky-100 text-sky-800',
          icon: <TrendingUp className="h-5 w-5 text-sky-600" />
        };
      case 'threats':
        return {
          title: 'Threats (External)',
          color: 'rose',
          borderColor: 'border-rose-100',
          bgColor: 'bg-rose-50/15 border-rose-500/10',
          textColor: 'text-rose-700',
          badgeBg: 'bg-rose-100 text-rose-800',
          icon: <Activity className="h-5 w-5 text-rose-600" />
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Vitality Summary Panel */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Strategic Balance Index</span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{vitalityRatio}</span>
              <span className="text-sm font-semibold text-slate-500">Drivers-to-Limiters Ratio</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Calculated as positive drivers (Strengths + Opportunities: <span className="font-semibold text-slate-600">{positiveDrivers}</span>) divided by negative risk limiters (Weaknesses + Threats: <span className="font-semibold text-slate-600">{negativeLimiters}</span>).
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 border border-slate-100/80">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Strategic Health</span>
            <span className={`mt-1 block text-sm font-bold ${
              parseFloat(vitalityRatio) >= 1.5
                ? 'text-emerald-600'
                : parseFloat(vitalityRatio) >= 1.0
                ? 'text-amber-600'
                : 'text-rose-600'
            }`}>
              {parseFloat(vitalityRatio) >= 1.5
                ? 'Highly Viable (Strong tailwinds)'
                : parseFloat(vitalityRatio) >= 1.0
                ? 'Moderate Balance (Mitigation needed)'
                : 'High Risk (Headwinds dominating)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 SWOT Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((quad) => {
          const meta = getQuadrantMeta(quad);
          const items = result[quad];

          return (
            <div key={quad} className={`flex flex-col rounded-2xl border ${meta.bgColor} p-5 shadow-sm`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {meta.icon}
                  <h3 className="font-sans text-base font-bold text-slate-800">{meta.title}</h3>
                </div>
                <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${meta.badgeBg}`}>
                  Sum: {calculateTotal(items)}
                </span>
              </div>

              {/* Items List */}
              <div className="mt-4 flex-1 space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="group relative rounded-xl border border-slate-100 bg-white p-3 pr-8 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-sm font-semibold text-slate-800">{item.text}</span>
                        {item.explanation && (
                          <p className="mt-1 text-xs text-slate-400 leading-normal">{item.explanation}</p>
                        )}
                      </div>

                      {/* Interactive Weight Slider */}
                      <div className="flex shrink-0 flex-col items-center gap-1.5">
                        <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">Impact</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleImpactChange(quad, idx, star)}
                              className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                                star <= item.impact
                                  ? quad === 'strengths'
                                    ? 'bg-emerald-500'
                                    : quad === 'opportunities'
                                    ? 'bg-sky-500'
                                    : quad === 'weaknesses'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                  : 'bg-slate-200'
                              }`}
                              title={`Set impact to ${star}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-500">
                          {item.impact}
                        </span>
                      </div>
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => handleDeleteItem(quad, idx)}
                      className="absolute right-2 top-2.5 rounded p-1 text-slate-300 hover:bg-slate-50 hover:text-rose-600 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="flex py-6 justify-center items-center">
                    <span className="text-xs text-slate-400 italic">No variables added to this quadrant.</span>
                  </div>
                )}
              </div>

              {/* Add Custom SWOT Item */}
              <div className="mt-4 border-t border-slate-100/60 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Add custom ${quad.slice(0, -1)}...`}
                    value={newText[quad] || ''}
                    onChange={(e) => setNewText({ ...newText, [quad]: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400"
                  />
                  <select
                    value={newImpact[quad] || 3}
                    onChange={(e) => setNewImpact({ ...newImpact, [quad]: parseInt(e.target.value) })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400"
                  >
                    <option value="1">Imp: 1</option>
                    <option value="2">Imp: 2</option>
                    <option value="3">Imp: 3</option>
                    <option value="4">Imp: 4</option>
                    <option value="5">Imp: 5</option>
                  </select>
                  <button
                    onClick={() => handleAddItem(quad)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
